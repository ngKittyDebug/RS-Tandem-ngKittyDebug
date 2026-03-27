# Backend Code Review — MeowVault

## Дата ревью: 2026-03-25

## Общая оценка: 5.0/10

С предыдущего ревью (2026-03-19): исправлены `ForbiddenException` → `UnauthorizedException` при логине, убран `@Public()` с `KeyStorageController`, добавлен `provider: true` в `refresh()`, исправлена опечатка `update-avater.dto.ts`. Появился `MergeGameModule` с AI-интеграцией (Groq), новым `RolesGuard`, `DataController`, `WordController`. Однако `RolesGuard` использует `ImATeapotException` при отсутствии пользователя, `AiService` поглощает все ошибки в `catch {}` → `BadRequestException`, AI-эндпоинт не защищён Rate Limiting, переменные `AI_KEY`/`AI_URL`/`AI_MODEL` отсутствуют в `.env.example`. Большинство критических замечаний по аутентификации не тронуты.

> **Источники best practices:** [NestJS Official Docs](https://docs.nestjs.com), [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors), NestJS Best Practices Skill

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 6/10 | Есть замечания | ↓ |
| 2. Безопасность | 3/10 | Критические проблемы | ↑ |
| 3. Качество кода и чистота | 5/10 | Существенные замечания | = |
| 4. Обработка ошибок | 3/10 | Критические проблемы | ↓ |
| 5. База данных и Prisma | 4/10 | Существенные замечания | ↓ |
| 6. Тестирование | 5/10 | Есть замечания | = |
| 7. Конфигурация и DevOps | 3/10 | Критические проблемы | ↓ |
| 8. API дизайн и документация | 4/10 | Существенные замечания | ↓ |

---

## 1. Архитектура и структура проекта (6/10)

### `[RESOLVED]` `@Public()` убран с `KeyStorageController`

**Файл:** `src/modules/key-storage/key-storage.controller.ts`

Декоратор `@Public()` убран — теперь все эндпоинты `KeyStorage` защищены глобальным `JwtAuthGuard`.

---

### `[RESOLVED]` `ForbiddenException` → `UnauthorizedException` при логине

**Файл:** `src/modules/auth/auth.service.ts:123,139`

---

### `[RESOLVED]` `provider: true` добавлен в `select` при `refresh()`

**Файл:** `src/modules/auth/auth.service.ts:221`

---

### `[RESOLVED]` Опечатка `update-avater.dto.ts` исправлена

**Файл:** `src/modules/user/dto/update-avatar.dto.ts`

---

### `[RESOLVED]` `githubOauth` — `upsert` по `providerId` исключает P2002

**Файл:** `src/modules/auth/auth.service.ts:93-106`

`upsert` по полю `providerId` (уникальный идентификатор провайдера) — корректный паттерн, race condition по этому ключу невозможен.

---

### `[MAJOR]` `RolesGuard` использует `ImATeapotException` при отсутствии пользователя — НОВОЕ

**Файл:** `src/guards/role.guard.ts:24-26`

> **Правило `error-throw-http-exceptions`** (NestJS Best Practices, HIGH). [RFC 7235 — HTTP Authentication](https://datatracker.ietf.org/doc/html/rfc7235#section-3.1)

`HTTP 418 I'm a teapot` — шуточный статус RFC 2324, недопустимый в production API. Отсутствие пользователя означает проблему аутентификации (`401 Unauthorized`), а не отсутствие прав.

```ts
if (!user) {
  throw new ImATeapotException(); // HTTP 418 — ломает клиентскую обработку ошибок
}
```

**Исправление:** `throw new UnauthorizedException('Требуется аутентификация')`

---

### `[MAJOR]` `RolesGuard` сравнивает массив с `===` — НОВОЕ

**Файл:** `src/guards/role.guard.ts:28`

```ts
if (user.role === roles) { // roles может быть string | string[]
  return true;
}
```

`@Roles('admin', 'moderator')` передаст `roles = ['admin', 'moderator']`, и `user.role === ['admin', 'moderator']` всегда `false`. Guard работает только потому, что `@Roles` везде вызывается с одной строкой.

**Исправление:**
```ts
const rolesArray = Array.isArray(roles) ? roles : [roles];
return rolesArray.includes(user.role);
```

---

### `[MINOR]` Дублирование `AuthResponse`/`LogoutResponse` в тест-файле — ЧАСТИЧНО НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.controller.spec.ts:9-15`

Интерфейсы по-прежнему определены локально, хотя существуют в `src/modules/interface/auth-module-types.ts`.

**Исправление:** `import { AuthResponse, LogoutResponse } from '../../interface/auth-module-types';`

---

### `[MINOR]` Опечатка `gtUserProfile` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:30`

```ts
public async gtUserProfile(id: string) {
```

**Исправление:** Переименовать в `getUserProfile` синхронно в сервисе и контроллере.

---

## 2. Безопасность (3/10)

### `[CRITICAL]` Нет Rate Limiting на AI-эндпоинте (`/ai/check-answer`) — НОВОЕ

**Файл:** `src/modules/games/merge-game/ai/ai.controller.ts:26`

> **Правило `security`** (NestJS Best Practices, CRITICAL). [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

Любой авторизованный пользователь может неограниченно вызывать `POST /ai/check-answer`. Каждый запрос уходит в Groq API — прямые расходы. Нет ни `@nestjs/throttler`, ни ограничения токенов.

**Исправление:**
```ts
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])
// ai.controller.ts
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('check-answer')
```

---

### `[CRITICAL]` Refresh token не хранится в БД — logout можно обойти — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:21-34`, `src/modules/auth/auth.service.ts:244-248`

Модель `User` не содержит поля для хранения refresh token. `logout()` только очищает cookie, сам токен остаётся валидным до истечения TTL.

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH). [NestJS JWT refresh tokens](https://docs.nestjs.com/security/authentication#jwt-refresh-tokens)

**Исправление:**
1. Добавить `refreshToken String?` в модель `User`
2. При `auth()` — хешировать и сохранять refresh token в БД
3. При `refresh()` — сравнивать с хешем в БД
4. При `logout()` — обнулять поле в БД

---

### `[CRITICAL]` `verifyAsync` не обёрнут в `try/catch` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:209`

```ts
const payload: JwtPayload = await this.jwtService.verifyAsync(refresh);
```

`verifyAsync` бросает `JsonWebTokenError`/`TokenExpiredError`. Без `try/catch` клиент получает 500 вместо 401.

**Исправление:**
```ts
let payload: JwtPayload;
try {
  payload = await this.jwtService.verifyAsync<JwtPayload>(refresh);
} catch {
  throw new UnauthorizedException('Токен больше не действителен');
}
```

---

### `[CRITICAL]` `.env.example` содержит реальный пароль — НЕ ИСПРАВЛЕНО

**Файл:** `backend/.env.example:11-13`

```
DEVELOPMENT_POSTGRES=postgresql://postgres:123456@localhost:5433/postgresql
POSTGRES_PASSWORD=123456
```

**Исправление:**
```
DEVELOPMENT_POSTGRES=postgresql://<user>:<password>@localhost:5433/<db_name>
POSTGRES_PASSWORD=<your-strong-password>
```

---

### `[MAJOR]` `USER_PATTERN` и `EMAIL_PATTERN` не синхронизированы с фронтендом — НЕ ИСПРАВЛЕНО

**Файл:** `shared/regexp-pattern.ts`

Паттерны определены в `shared/`, но фронтенд использует собственные файлы `core/patterns/`. Расхождение паттернов = разные правила валидации на клиенте и сервере.

**Исправление:** Синхронизировать паттерны или вынести в общий пакет.

---

### `[MAJOR]` OAuth-пользователи не отсекаются в `updateUser` и `updatePassword` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:82-157`

GitHub-пользователи имеют `password: "null"` (строка по умолчанию). `bcrypt.compare(dto.password, "null")` вернёт `false` вместо ошибки "операция недоступна для OAuth".

**Исправление:** Добавить проверку `if (user.provider !== Provider.local)` в начале `updateUser` и `updatePassword`. Включить `provider` в `select`.

---

### `[MAJOR]` Непрофессиональное сообщение `"звоните позже"` в `deleteUser` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:62`

```ts
throw new ForbiddenException(`Функционал пока не доступен, звоните позже`);
```

**Исправление:** `'Удаление аккаунта для OAuth-пользователей временно недоступно'`

---

### `[SUGGESTION]` Отсутствует Rate Limiting на auth endpoints — НЕ ИСПРАВЛЕНО

> [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

---

## 3. Качество кода и чистота (5/10)

### `[MAJOR]` `logout` передаёт строку `'refreshToken'` как значение cookie — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:245`

```ts
logout(res: Response): LogoutResponse {
  this.sendCookie(res, 'refreshToken', new Date(0));
  // sendCookie(res, token: string, expires: Date) — второй аргумент = ЗНАЧЕНИЕ cookie
  // итог: cookie 'refreshToken' = 'refreshToken' (строка), а не ''
```

**Исправление:** `this.sendCookie(res, '', new Date(0));`

---

### `[MAJOR]` `BCRYPT_SALT` — нет проверки на `NaN` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:39`

`configService.getOrThrow<number>('BCRYPT_SALT')` — дженерик не конвертирует, возвращается строка. `+this.SALT` без валидации. Если `BCRYPT_SALT` не число — `genSalt(NaN)` даёт непредсказуемый результат.

**Исправление:**
```ts
const raw = configService.getOrThrow<string>('BCRYPT_SALT');
const salt = parseInt(raw, 10);
if (Number.isNaN(salt) || salt < 4 || salt > 31) {
  throw new Error(`BCRYPT_SALT must be 4-31, got: "${raw}"`);
}
```

---

### `[MAJOR]` `CheckAnswerDto.personality` типизирован как `string` вместо `PersonalityType` — НОВОЕ

**Файл:** `src/modules/games/merge-game/ai/dto/check-answer.dto.ts:39`

```ts
@IsEnum(PersonalityType)
personality: string; // должно быть PersonalityType
```

`PERSONALITIES[checkAnswerDto.personality]` при невалидном значении вернёт `undefined`, и `systemPrompt` будет `undefined ${PERSONALITY_DESCRIPTION}`.

**Исправление:** `personality: PersonalityType;`

---

### `[MINOR]` Мёртвая ветка `throw` после `if (payload)` в `refresh()` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:211,232`

```ts
if (payload) { // после verifyAsync payload всегда truthy
  // ...
  return this.auth(res, user);
}
throw new UnauthorizedException('...'); // недостижимый код
```

**Исправление:** Убрать `if (payload)` и хвостовой `throw` после добавления `try/catch`.

---

### `[MINOR]` Неиспользуемый импорт `Request` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:8`

```ts
import { Request } from 'express'; // не используется
```

---

### `[MINOR]` `main.ts:47` — неверный тип `<number>` для `DEV_HOST` — НЕ ИСПРАВЛЕНО

**Файл:** `src/main.ts:47`

```ts
const host = config.getOrThrow<number>('DEV_HOST'); // DEV_HOST — строка URL
```

**Исправление:** `config.getOrThrow<string>('DEV_HOST')`

---

### `[MINOR]` `KeyStorageService` инжектирует `ConfigService` без использования — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/key-storage/key-storage.service.ts:10-12`

```ts
constructor(
  private readonly prisma: PrismaService,
  private readonly configService: ConfigService, // не используется
) {}
```

---

## 4. Обработка ошибок (3/10)

### `[MAJOR]` `AiService.checkAnswer` — `catch {}` поглощает все ошибки — НОВОЕ

**Файл:** `src/modules/games/merge-game/ai/ai.service.ts:60-62`

> **Правило `error-handling`** (NestJS Best Practices, HIGH). [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

```ts
} catch {
  throw new BadRequestException('Groq API error');
}
```

`catch {}` без параметра поглощает `SyntaxError` от `JSON.parse`, сетевые ошибки, ошибки конфигурации — всё маскируется под `BadRequestException` (400). `SyntaxError` — это 500, не 400. Кроме того, внутренние `BadRequestException` (строки 47, 53, 56) тоже поглощаются и re-throw'ятся как новый `BadRequestException`.

**Исправление:**
```ts
} catch (error) {
  if (error instanceof BadRequestException) throw error; // пробросить валидационные ошибки
  if (error instanceof SyntaxError) throw new InternalServerErrorException('AI response parse error');
  throw new InternalServerErrorException('Groq API unavailable');
}
```

---

### `[CRITICAL]` `refresh()` не ловит ошибку `jwtService.verifyAsync` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:209`

(см. раздел 2 — Безопасность)

---

### `[MAJOR]` Race condition TOCTOU — `prisma.user.create` без `try/catch` для P2002 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:63-73`

> [Prisma Error Handling — P2002](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors)

**Исправление:**
```ts
try {
  return await this.prisma.user.create({ data: { ... } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('Пользователь уже существует');
  }
  throw error;
}
```

---

### `[MAJOR]` `KeyStorageService.findOne` возвращает `null` вместо `NotFoundException` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/key-storage/key-storage.service.ts:36-44`

> Контроллер документирует `@ApiResponse({ status: NOT_FOUND })`, но сервис возвращает `null` — клиент получит `200 null`. [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

**Исправление:**
```ts
if (!storage) throw new NotFoundException(`Запись с ключом '${key}' не найдена`);
return storage;
```

---

### `[SUGGESTION]` Отсутствует глобальный Exception Filter — НЕ ИСПРАВЛЕНО

> [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

---

## 5. База данных и Prisma (4/10)

### `[MAJOR]` Отсутствует `url` в `datasource db` — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:6-8`

```prisma
datasource db {
  provider = "postgresql"
  // url отсутствует
}
```

> [Prisma — datasource url](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#url)

CLI-команды `prisma migrate dev`, `prisma migrate deploy`, `prisma studio` требуют `url`. Без него миграции не применяются стандартным способом.

**Исправление:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### `[MAJOR]` Модель `User` не хранит refresh token — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:21-34`

(см. раздел 2 — Безопасность)

---

### `[MINOR]` `DataService.remove` — двойной запрос к БД вместо атомарного delete — НОВОЕ

**Файл:** `src/modules/games/merge-game/data/data.service.ts:126-133`

```ts
async remove(id: number) {
  await this.findOne(id); // лишний SELECT
  await this.prisma.mergeGameData.delete({ where: { id } });
}
```

`KeyStorageService.remove` использует правильный паттерн — один `delete` с перехватом `P2025`. `DataService`, `WordService`, `QuestionService` используют антипаттерн двойного запроса.

**Исправление:**
```ts
async remove(id: number) {
  try {
    return await this.prisma.mergeGameData.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException(`Запись с id=${id} не найдена`);
    }
    throw error;
  }
}
```

---

## 6. Тестирование (5/10)

### `[MINOR]` Тест `verifyAsync` мокает `UnauthorizedException` вместо `JsonWebTokenError` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:208-214`

**Исправление:** `new JsonWebTokenError('invalid token')` вместо `new UnauthorizedException(...)`

---

### `[MINOR]` Тест `logout` закрепляет некорректное поведение — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:260-270`

```ts
expect(responseMock.cookie).toHaveBeenCalledWith(
  'refreshToken',
  'refreshToken', // баг: значение должно быть '', а не 'refreshToken'
  ...
```

**Исправление:** После исправления `logout()` ожидать `''` вторым аргументом.

---

### `[MINOR]` `mockPayload` в тесте не содержит `provider` и `role` — НОВОЕ

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:85-89`

```ts
const mockPayload: JwtPayload = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  // provider и role отсутствуют
};
```

---

### `[SUGGESTION]` E2E тест проверяет несуществующий маршрут `GET /` — НЕ ИСПРАВЛЕНО

**Файл:** `test/app.e2e-spec.ts`

---

### `[SUGGESTION]` Нет тестов для game-модулей и AI-интеграции — НЕ ИСПРАВЛЕНО

---

## 7. Конфигурация и DevOps (3/10)

### `[CRITICAL]` `AI_KEY`, `AI_URL`, `AI_MODEL` отсутствуют в `.env.example` — НОВОЕ

**Файл:** `backend/.env.example`

> `AiService` вызывает `configService.getOrThrow('AI_KEY')`, `getOrThrow('AI_URL')`, `getOrThrow('AI_MODEL')`. При отсутствии переменных приложение упадёт при старте с криптичной ошибкой.

**Исправление:** Добавить в `.env.example`:
```
AI_KEY=<groq-api-key>
AI_URL=https://api.groq.com/openai/v1/chat/completions
AI_MODEL=<model-name>
```

---

### `[MAJOR]` `@nestjs/mapped-types: "*"` — неограниченная версия — НЕ ИСПРАВЛЕНО

**Файл:** `package.json:37`

**Исправление:** `"@nestjs/mapped-types": "^2.0.6"`

---

### `[MINOR]` `tsconfig.json` — `noImplicitAny: false` — НЕ ИСПРАВЛЕНО

> [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig#noImplicitAny)

---

### `[MINOR]` ESLint — `no-floating-promises` и `no-unsafe-argument` как `warn` — НЕ ИСПРАВЛЕНО

CI без `--max-warnings=0` не ломает билд на предупреждениях.

---

## 8. API дизайн и документация (4/10)

### `[MAJOR]` `DataController.findAll` и `WordController.findAll` — пагинация без валидации — НОВОЕ

**Файлы:** `src/modules/games/merge-game/data/data.controller.ts:47-53`, `word/word.controller.ts:38-43`

> **Правило** (NestJS Pipes). [NestJS Pipes — ParseIntPipe](https://docs.nestjs.com/pipes#built-in-pipes)

```ts
findAll(@Query('page') page?: string) {
  const pageNum = page ? +page : 1; // +page = NaN при 'abc'
```

`+page` при нечисловой строке даёт `NaN`. `prisma.findMany({ skip: NaN })` вернёт некорректный результат.

**Исправление:**
```ts
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
```

---

### `[MAJOR]` `AiController` не имеет `@ApiTags` и `@ApiAuth` — НОВОЕ

**Файл:** `src/modules/games/merge-game/ai/ai.controller.ts:7-8`

AI-эндпоинт не сгруппирован в Swagger UI и не помечен как требующий авторизации. Нарушение внутреннего соглашения (`@ApiSwagger`, `@ApiAuth`).

**Исправление:** Добавить `@ApiTags('AI')` и `@ApiAuth()` (или соответствующий внутренний декоратор) на класс контроллера.

---

### `[MINOR]` `POST /key-storage` возвращает `201` при upsert — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/key-storage/key-storage.controller.ts:30`

> [RFC 9110 — 201 Created](https://www.rfc-editor.org/rfc/rfc9110#name-201-created): `201` следует возвращать только при создании.

**Исправление:** Убрать `@HttpCode(HttpStatus.CREATED)` или разделить на `POST` (201) и `PUT` (200).

---

### `[MINOR]` `@ApiResponse` для login документирует 403 — обновить на 401 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.controller.ts`

После исправления `ForbiddenException` → `UnauthorizedException` `@ApiResponse` не обновлён.

---

## 9. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Добавить `AI_KEY`, `AI_URL`, `AI_MODEL` в `.env.example`
- [ ] Добавить Rate Limiting (`@nestjs/throttler`) на `/ai/check-answer`
- [ ] Обернуть `verifyAsync` в `try/catch` → `UnauthorizedException`
- [ ] Добавить `refreshToken String?` в `schema.prisma` + хеш в БД при login/refresh + обнулить при logout
- [ ] Заменить credentials в `.env.example` на плейсхолдеры
- [ ] Исправить `ImATeapotException` → `UnauthorizedException` в `RolesGuard`

### Приоритет 2 (важно)
- [ ] Исправить `AiService.checkAnswer` catch — различать клиентские и серверные ошибки
- [ ] Исправить `logout()` — `this.sendCookie(res, '', new Date(0))`
- [ ] Исправить `RolesGuard` — сравнивать через `Array.isArray` + `includes`
- [ ] Добавить `ParseIntPipe` для `page`/`limit` в `DataController` и `WordController`
- [ ] Проверять `provider !== Provider.local` в `updateUser` и `updatePassword`
- [ ] `findOne` в key-storage — бросать `NotFoundException` при `null`
- [ ] Добавить `url = env("DATABASE_URL")` в `datasource db`
- [ ] Переименовать `gtUserProfile` → `getUserProfile`
- [ ] Добавить `parseInt` + `Number.isNaN` для `BCRYPT_SALT`
- [ ] Зафиксировать версию `@nestjs/mapped-types`
- [ ] Исправить сообщение `"звоните позже"` в `deleteUser`
- [ ] Обернуть `prisma.user.create` в `try/catch` для P2002
- [ ] `CheckAnswerDto.personality` → `PersonalityType`

### Приоритет 3 (желательно)
- [ ] Добавить `@ApiTags` и `@ApiAuth` на `AiController`
- [ ] Удалить `ConfigService` из `KeyStorageService`
- [ ] Удалить мёртвую ветку `throw` в `refresh()`
- [ ] Удалить неиспользуемый импорт `Request` в `user.service.ts`
- [ ] Исправить мок в тесте `refresh` — `JsonWebTokenError`
- [ ] Исправить тест `logout` — ожидать `''` вместо `'refreshToken'`
- [ ] Удалить дублирование интерфейсов в `auth.controller.spec.ts`
- [ ] Включить `noImplicitAny: true` в tsconfig
- [ ] Поднять ESLint warnings до errors
- [ ] Убрать `@HttpCode(HttpStatus.CREATED)` с upsert endpoint
- [ ] Исправить `DataService.remove` — атомарный delete с перехватом P2025

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| NestJS Authentication | https://docs.nestjs.com/security/authentication |
| NestJS JWT refresh tokens | https://docs.nestjs.com/security/authentication#jwt-refresh-tokens |
| NestJS Rate Limiting | https://docs.nestjs.com/security/rate-limiting |
| NestJS Exception Filters | https://docs.nestjs.com/exception-filters |
| NestJS Pipes — ParseIntPipe | https://docs.nestjs.com/pipes#built-in-pipes |
| Prisma Error Reference P2002/P2025 | https://www.prisma.io/docs/orm/reference/error-reference |
| Prisma datasource url | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#url |
| RFC 7235 — 401 vs 403 | https://datatracker.ietf.org/doc/html/rfc7235#section-3.1 |
| RFC 9110 — 201 Created | https://www.rfc-editor.org/rfc/rfc9110#name-201-created |
| TypeScript — noImplicitAny | https://www.typescriptlang.org/tsconfig#noImplicitAny |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 5.5/10 | 4 | 8 | 6 |
| 2026-03-09 | 6.0/10 | 4 | 9 | 6 |
| 2026-03-16 | 6.0/10 | 3 | 8 | 5 |
| 2026-03-19 | 5.5/10 | 5 | 13 | 11 |
| 2026-03-25 | 5.0/10 | 5 | 12 | 9 |
