# Backend Code Review — MeowVault

## Дата ревью: 2026-04-09

## Общая оценка: 4.5/10

С предыдущего ревью (2026-03-25): добавлены `AI_KEY`/`AI_URL`/`AI_MODEL` в `.env.example` — единственное закрытое CRITICAL. Появились новые игровые модули (`CitiesGame`, `HangmanGame`, `EventLoopGame`). В auth-модуле обнаружены два новых CRITICAL: `registration()` не перехватывает `P2002` при race condition, `githubOauth` может перезаписать email другого пользователя. Пять CRITICAL из предыдущего ревью остаются открытыми без изменений. Из 12 MAJOR предыдущего цикла — ни одного не закрыто, добавились ещё три.

> **Источники best practices:** [NestJS Official Docs](https://docs.nestjs.com), [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors), NestJS Best Practices Skill

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 5/10 | Критические проблемы | ↓ |
| 2. Безопасность | 3/10 | Критические проблемы | = |
| 3. Качество кода и чистота | 5/10 | Существенные замечания | = |
| 4. Обработка ошибок | 3/10 | Критические проблемы | = |
| 5. База данных и Prisma | 4/10 | Существенные замечания | = |
| 6. Тестирование | 5/10 | Есть замечания | = |
| 7. Конфигурация и DevOps | 4/10 | Существенные замечания | ↑ |
| 8. API дизайн и документация | 4/10 | Существенные замечания | = |

---

## 1. Архитектура и структура проекта (5/10)

### `[RESOLVED]` `@Public()` убран с `KeyStorageController`

**Файл:** `src/modules/key-storage/key-storage.controller.ts`

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

---

### `[CRITICAL]` `registration()` не перехватывает `P2002` при race condition — НОВОЕ

**Файл:** `src/modules/auth/auth.service.ts:54-84`

> **Правило `P2002-race-condition`** (Prisma Error Reference, CRITICAL). [Prisma — Known errors P2002](https://www.prisma.io/docs/orm/reference/error-reference#p2002)

`registration()` сначала проверяет `findOne` (строка 54), затем создаёт пользователя через `prisma.user.create` без `try/catch`. При одновременной регистрации двух пользователей с одинаковым `email`/`username` Prisma выбросит `PrismaClientKnownRequestError P2002`, который не перехватывается — клиент получает 500.

```ts
// Проблемный код: create без защиты от P2002
const user = await this.prisma.user.create({
  data: { email: dto.email, password: ..., username: dto.username },
  omit: { password: true },
});
```

**Исправление:**
```ts
try {
  const user = await this.prisma.user.create({ ... });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('Пользователь уже существует');
  }
  throw error;
}
```

---

### `[CRITICAL]` `githubOauth` — `update`-ветка перезаписывает `email` пользователя — НОВОЕ

**Файл:** `src/modules/auth/auth.service.ts:87-117`

> **Правило `security-oauth-account-takeover`** (OWASP A07, CRITICAL). [OWASP — Account Takeover](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/04-Authentication_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account)

`update`-ветка `upsert` обновляет `email` пользователя значением из GitHub-профиля. GitHub не гарантирует стабильность email между сессиями. При смене email в GitHub уже существующий пользователь получит обновлённый email в следующую OAuth-сессию — потенциальное нарушение идентичности.

```ts
update: {
  username: username ?? fallbackUsername,
  email: emails?.[0]?.value ?? fallbackEmail, // email не должен обновляться
},
```

**Исправление:**
```ts
update: {
  username: username ?? fallbackUsername,
  // email не обновляем — providerId уже однозначно идентифицирует пользователя
},
```

---

### `[MAJOR]` `RolesGuard` использует `ImATeapotException` при отсутствии пользователя — НЕ ИСПРАВЛЕНО

**Файл:** `src/guards/role.guard.ts:24-26`

> **Правило `error-throw-http-exceptions`** (NestJS Best Practices, HIGH). [RFC 7235 — HTTP Authentication](https://datatracker.ietf.org/doc/html/rfc7235#section-3.1)

`HTTP 418 I'm a teapot` — шуточный статус RFC 2324, недопустимый в production API.

```ts
if (!user) {
  throw new ImATeapotException(); // HTTP 418 — ломает клиентскую обработку ошибок
}
```

**Исправление:** `throw new UnauthorizedException('Требуется аутентификация')`

---

### `[MAJOR]` `RolesGuard` сравнивает массив с `===` — НЕ ИСПРАВЛЕНО

**Файл:** `src/guards/role.guard.ts:28`

```ts
if (user.role === roles) { // roles: string[] — сравнение всегда false
  return true;
}
```

**Исправление:**
```ts
const rolesArray = Array.isArray(roles) ? roles : [roles];
return rolesArray.includes(user.role);
```

---

### `[MINOR]` Дублирование `AuthResponse`/`LogoutResponse` в тест-файле — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.controller.spec.ts:9-15`

**Исправление:** `import { AuthResponse, LogoutResponse } from '../../interface/auth-module-types';`

---

### `[MINOR]` Опечатка `gtUserProfile` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:30`

```ts
public async gtUserProfile(id: string) { // должно быть getUserProfile
```

---

## 2. Безопасность (3/10)

### `[CRITICAL]` Нет Rate Limiting на AI-эндпоинте (`/ai/check-answer`) — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/games/merge-game/ai/ai.controller.ts:26`

> **Правило `security`** (NestJS Best Practices, CRITICAL). [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

Каждый запрос уходит в Groq API — прямые расходы. Нет `@nestjs/throttler`.

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

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH). [NestJS JWT refresh tokens](https://docs.nestjs.com/security/authentication#jwt-refresh-tokens)

`logout()` только очищает cookie, сам токен остаётся валидным до истечения TTL.

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
// Без try/catch: JsonWebTokenError/TokenExpiredError → 500 вместо 401
```

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

**Исправление:** Заменить на `<your-strong-password>`

---

### `[MAJOR]` `USER_PATTERN` и `EMAIL_PATTERN` не синхронизированы с фронтендом — НЕ ИСПРАВЛЕНО

**Файл:** `shared/regexp-pattern.ts`

Паттерны определены в `shared/`, но фронтенд использует собственные файлы `core/patterns/`. Расхождение = разные правила валидации на клиенте и сервере.

---

### `[MAJOR]` OAuth-пользователи не отсекаются в `updateUser` и `updatePassword` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:82-157`

GitHub-пользователи имеют `password: "null"` (строка по умолчанию). Следует явно отклонять запрос:

```ts
if (user.provider !== Provider.local) {
  throw new ForbiddenException('Функционал недоступен для OAuth-пользователей');
}
```

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
this.sendCookie(res, 'refreshToken', new Date(0));
// sendCookie(res, token: string, expires: Date) — второй аргумент = ЗНАЧЕНИЕ cookie
// итог: cookie 'refreshToken' = 'refreshToken' (строка), а не ''
```

**Исправление:** `this.sendCookie(res, '', new Date(0));`

---

### `[MAJOR]` `BCRYPT_SALT` — нет проверки на `NaN` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:39`

`configService.getOrThrow<number>('BCRYPT_SALT')` — дженерик не конвертирует. `genSalt(NaN)` даёт непредсказуемый результат.

**Исправление:**
```ts
const raw = configService.getOrThrow<string>('BCRYPT_SALT');
const salt = parseInt(raw, 10);
if (Number.isNaN(salt) || salt < 4 || salt > 31) {
  throw new Error(`BCRYPT_SALT must be 4-31, got: "${raw}"`);
}
```

---

### `[MAJOR]` `CheckAnswerDto.personality` типизирован как `string` вместо `PersonalityType` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/games/merge-game/ai/dto/check-answer.dto.ts:39`

`@IsEnum(PersonalityType)` добавлен (runtime-валидация), но тип поля остаётся `string` на уровне TypeScript.

```ts
@IsEnum(PersonalityType)
personality: string; // должно быть PersonalityType
```

**Исправление:** `personality: PersonalityType;`

---

### `[MINOR]` Мёртвая ветка `throw` после `if (payload)` в `refresh()` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:211,232`

```ts
if (payload) { // после verifyAsync payload всегда truthy
  return this.auth(res, user);
}
throw new UnauthorizedException('...'); // недостижимый код
```

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

### `[MAJOR]` `AiService.checkAnswer` — `catch {}` поглощает все ошибки — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/games/merge-game/ai/ai.service.ts:60-62`

> **Правило `error-handling`** (NestJS Best Practices, HIGH). [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

```ts
} catch {
  throw new BadRequestException('Groq API error');
}
```

Внутренние `BadRequestException` (строки 47, 53, 56) тоже поглощаются и re-throw'ятся как новый `BadRequestException`.

**Исправление:**
```ts
} catch (error) {
  if (error instanceof HttpException) throw error;
  this.logger.error('Groq API error', error);
  throw new InternalServerErrorException('Ошибка при обращении к ИИ-сервису');
}
```

---

### `[CRITICAL]` `refresh()` не ловит ошибку `jwtService.verifyAsync` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:209`

(см. раздел 2 — Безопасность)

---

### `[MAJOR]` Race condition TOCTOU — `prisma.user.create` без `try/catch` для P2002 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:63-73`

(см. раздел 1 — новое CRITICAL)

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

### `[MINOR]` `DataService.remove` — двойной запрос к БД вместо атомарного delete — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/games/merge-game/data/data.service.ts:126-133`

```ts
async remove(id: number) {
  await this.findOne(id); // лишний SELECT
  await this.prisma.mergeGameData.delete({ where: { id } });
}
```

**Исправление:** один `delete` с перехватом `P2025`.

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
  'refreshToken', // баг: значение должно быть ''
  ...
```

---

### `[MINOR]` `mockPayload` в тесте не содержит `provider` и `role` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:85-89`

---

### `[MINOR]` `ai.service.spec.ts` — нет ни одного теста для `checkAnswer` — НОВОЕ

**Файл:** `src/modules/games/merge-game/ai/__tests__/ai.service.spec.ts`

> **Правило** (nestjs-testing-expert): Критические пути AI-интеграции (успех, ошибка Groq API, некорректный JSON) должны быть покрыты тестами.

Файл содержит только `it('should be defined')`. Метод `checkAnswer` — главная функция AI-модуля — не тестируется вовсе.

---

### `[SUGGESTION]` E2E тест проверяет несуществующий маршрут `GET /` — НЕ ИСПРАВЛЕНО

**Файл:** `test/app.e2e-spec.ts`

---

### `[SUGGESTION]` Нет тестов для game-модулей и AI-интеграции — НЕ ИСПРАВЛЕНО

---

## 7. Конфигурация и DevOps (4/10)

### `[RESOLVED]` `AI_KEY`, `AI_URL`, `AI_MODEL` добавлены в `.env.example`

**Файл:** `backend/.env.example:33-35`

Переменные присутствуют в файле — онбординг новых разработчиков исправлен.

---

### `[MAJOR]` `@nestjs/mapped-types: "*"` — неограниченная версия — НЕ ИСПРАВЛЕНО

**Файл:** `package.json:37`

```json
"@nestjs/mapped-types": "*"
```

**Исправление:** `"@nestjs/mapped-types": "^2.0.6"`

---

### `[MINOR]` `tsconfig.json` — `noImplicitAny: false` — НЕ ИСПРАВЛЕНО

> [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig#noImplicitAny)

---

### `[MINOR]` ESLint — `no-floating-promises` и `no-unsafe-argument` как `warn` — НЕ ИСПРАВЛЕНО

CI без `--max-warnings=0` не ломает билд на предупреждениях.

---

### `[MINOR]` `AiService` — отсутствует `Logger` — НОВОЕ

**Файл:** `src/modules/games/merge-game/ai/ai.service.ts`

> **Правило** (NestJS Best Practices): Все сервисы, выполняющие IO-операции, должны иметь `Logger` для диагностики в production. [NestJS Logger](https://docs.nestjs.com/techniques/logger)

В `AiService` нет `private readonly logger = new Logger(AiService.name)`. При сбоях Groq API нет никакого логирования.

**Исправление:**
```ts
private readonly logger = new Logger(AiService.name);

// В catch:
this.logger.error('Groq API error', error);
```

---

## 8. API дизайн и документация (4/10)

### `[MAJOR]` `DataController.findAll` — пагинация без валидации, возможен NaN — НЕ ИСПРАВЛЕНО

**Файлы:** `src/modules/games/merge-game/data/data.controller.ts:46-54`

> [NestJS Pipes — ParseIntPipe](https://docs.nestjs.com/pipes#built-in-pipes)

```ts
const pageNum = page ? +page : 1; // +page = NaN при 'abc'
```

**Исправление:**
```ts
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
```

---

### `[MAJOR]` `WordController.findAll` — `dataId` из query не валидируется, возможен NaN — НОВОЕ

**Файл:** `src/modules/games/merge-game/word/word.controller.ts:38-43`

> [NestJS Pipes — ParseIntPipe](https://docs.nestjs.com/pipes#built-in-pipes)

`+dataId` при нечисловом значении даёт `NaN`. Prisma-запрос с `where: { dataId: NaN }` вернёт пустой результат без ошибки — молчаливый баг.

```ts
if (dataId) {
  return this.wordService.findByDataId(+dataId); // +dataId = NaN
}
```

**Исправление:**
```ts
@Get()
findAll(@Query('dataId', new ParseIntPipe({ optional: true })) dataId?: number) {
  if (dataId !== undefined) {
    return this.wordService.findByDataId(dataId);
  }
  return this.wordService.findAll();
}
```

---

### `[MAJOR]` `QuestionController.findAll` — `wordId` из query не валидируется — НОВОЕ

**Файл:** `src/modules/games/merge-game/question/question.controller.ts:38-43`

Аналогичная проблема: `+wordId` при нечисловом значении → `NaN` → молчаливый баг в Prisma.

**Исправление:** аналогично `WordController` — `ParseIntPipe({ optional: true })`.

---

### `[MAJOR]` `DataService.findAll` — нет защиты от `limit=0` и отрицательных значений — НОВОЕ

**Файл:** `src/modules/games/merge-game/data/data.service.ts:37-72`

> **Правило** (API design): Параметры пагинации должны иметь ограничения. [NestJS Validation](https://docs.nestjs.com/techniques/validation)

При `limit=0` → `take: 0` → пустой массив + `totalPages = Infinity`. При `limit=-1` → ошибка Prisma.

```ts
const skip = (page - 1) * limit; // нет проверок на отрицательные значения и 0
```

**Исправление:**
```ts
const safePage = Math.max(1, page);
const safeLimit = Math.min(Math.max(1, limit), 100);
const skip = (safePage - 1) * safeLimit;
```

---

### `[MAJOR]` `AiController` не имеет `@ApiTags` и `@ApiAuth` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/games/merge-game/ai/ai.controller.ts:7-8`

AI-эндпоинт не сгруппирован в Swagger UI и не помечен как требующий авторизации.

**Исправление:** Добавить `@ApiTags('AI')` и `@ApiAuth()` на класс контроллера.

---

### `[MINOR]` `POST /key-storage` возвращает `201` при upsert — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/key-storage/key-storage.controller.ts:30`

> [RFC 9110 — 201 Created](https://www.rfc-editor.org/rfc/rfc9110#name-201-created)

---

### `[MINOR]` `@ApiResponse` для login документирует 403 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.controller.ts`

---

## 9. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Обернуть `prisma.user.create` в `try/catch` для P2002 в `registration()`
- [ ] Убрать обновление `email` в `githubOauth` `update`-ветке
- [ ] Добавить Rate Limiting (`@nestjs/throttler`) на `/ai/check-answer`
- [ ] Обернуть `verifyAsync` в `try/catch` → `UnauthorizedException`
- [ ] Добавить `refreshToken String?` в `schema.prisma` + хеш при login/refresh + обнулить при logout
- [ ] Заменить credentials в `.env.example` на плейсхолдеры

### Приоритет 2 (важно)
- [ ] Исправить `ImATeapotException` → `UnauthorizedException` в `RolesGuard`
- [ ] Исправить `RolesGuard` — `Array.isArray(roles) ? roles.includes(user.role) : user.role === roles`
- [ ] Исправить `AiService.checkAnswer` catch — различать HTTP и системные ошибки
- [ ] Добавить `ParseIntPipe` для `page`/`limit` в `DataController`
- [ ] Добавить `ParseIntPipe({ optional: true })` для `dataId` в `WordController`
- [ ] Добавить `ParseIntPipe({ optional: true })` для `wordId` в `QuestionController`
- [ ] Добавить guard на `limit` в `DataService.findAll` (min=1, max=100)
- [ ] Исправить `logout()` — `this.sendCookie(res, '', new Date(0))`
- [ ] Исправить `CheckAnswerDto.personality` → `PersonalityType`
- [ ] `findOne` в key-storage — бросать `NotFoundException` при `null`
- [ ] Добавить `url = env("DATABASE_URL")` в `datasource db`
- [ ] Проверять `provider !== Provider.local` в `updateUser` и `updatePassword`
- [ ] Добавить `parseInt` + `Number.isNaN` для `BCRYPT_SALT`
- [ ] Зафиксировать версию `@nestjs/mapped-types`
- [ ] Исправить сообщение `"звоните позже"` в `deleteUser`
- [ ] Добавить `Logger` в `AiService`

### Приоритет 3 (желательно)
- [ ] Добавить `@ApiTags` и `@ApiAuth` на `AiController`
- [ ] Добавить тесты для `checkAnswer` в `ai.service.spec.ts`
- [ ] Удалить `ConfigService` из `KeyStorageService`
- [ ] Удалить мёртвую ветку `throw` в `refresh()`
- [ ] Удалить неиспользуемый импорт `Request` в `user.service.ts`
- [ ] Исправить мок в тесте `refresh` — `JsonWebTokenError`
- [ ] Исправить тест `logout` — ожидать `''` вместо `'refreshToken'`
- [ ] Удалить дублирование интерфейсов в `auth.controller.spec.ts`
- [ ] Включить `noImplicitAny: true` в tsconfig
- [ ] Поднять ESLint warnings до errors
- [ ] Переименовать `gtUserProfile` → `getUserProfile`
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
| NestJS Logger | https://docs.nestjs.com/techniques/logger |
| Prisma Error Reference P2002/P2025 | https://www.prisma.io/docs/orm/reference/error-reference |
| Prisma datasource url | https://www.prisma.io/docs/orm/reference/prisma-schema-reference#url |
| RFC 7235 — 401 vs 403 | https://datatracker.ietf.org/doc/html/rfc7235#section-3.1 |
| RFC 9110 — 201 Created | https://www.rfc-editor.org/rfc/rfc9110#name-201-created |
| TypeScript — noImplicitAny | https://www.typescriptlang.org/tsconfig#noImplicitAny |
| OWASP — Account Takeover | https://owasp.org/www-project-web-security-testing-guide/ |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 5.5/10 | 4 | 8 | 6 |
| 2026-03-09 | 6.0/10 | 4 | 9 | 6 |
| 2026-03-16 | 6.0/10 | 3 | 8 | 5 |
| 2026-03-19 | 5.5/10 | 5 | 13 | 11 |
| 2026-03-25 | 5.0/10 | 5 | 12 | 9 |
| 2026-04-09 | 4.5/10 | 6 | 15 | 11 |
