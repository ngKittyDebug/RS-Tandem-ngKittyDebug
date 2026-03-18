# Backend Code Review — MeowVault

## Дата ревью: 2026-03-16

## Общая оценка: 6.0/10

С предыдущего ревью (2026-03-09): переименован `signIn` → `registration`, устранено дублирование `bcrypt`/`bcrypt-ts`, исправлен `logger.log` → `logger.error` в PrismaService, добавлены `app.enableShutdownHooks()` и глобальный `JwtAuthGuard`. В `UserModule` появились эндпоинты работы с профилем. Критические уязвимости безопасности остаются нетронутыми — refresh token не хранится в БД, `verifyAsync` не обёрнут в `try/catch`, `.env.example` содержит реальный пароль `123456`.

> **Источники best practices:** [NestJS Official Docs](https://docs.nestjs.com), [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors), NestJS Best Practices Skill

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 7/10 | Мелкие замечания | ↑ |
| 2. Безопасность | 3/10 | Критические проблемы | = |
| 3. Качество кода и чистота | 5/10 | Существенные замечания | ↓ |
| 4. Обработка ошибок | 4/10 | Существенные замечания | = |
| 5. База данных и Prisma | 5/10 | Существенные замечания | = |
| 6. Тестирование | 6/10 | Есть замечания | ↓ |
| 7. Конфигурация и DevOps | 5/10 | Есть замечания | ↑ |
| 8. API дизайн и документация | 7/10 | Мелкие замечания | = |

---

## 1. Архитектура и структура проекта (7/10)

Структура улучшилась: появился `UserModule` с контроллером, сервисом и DTOs. Глобальный `JwtAuthGuard` добавлен в `main.ts`. `signIn` переименован в `registration`. Интерфейсы вынесены в `src/modules/interface/auth-module-types.ts`.

### `[RESOLVED]` `signIn` переименован в `registration`

**Файл:** `src/modules/auth/auth.service.ts` и `auth.controller.ts`

Метод теперь корректно называется `registration` в сервисе, `register` в контроллере — семантика соответствует назначению.

---

### `[RESOLVED]` Глобальный `AuthGuard` добавлен

**Файл:** `src/main.ts:19`

```ts
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

Реализован `JwtAuthGuard` с поддержкой декоратора `@Public()` для публичных маршрутов. [NestJS Guards](https://docs.nestjs.com/guards)

---

### `[RESOLVED]` Дублирование интерфейсов `AuthResponse`/`LogoutResponse`

Интерфейсы вынесены в `src/modules/interface/auth-module-types.ts`. Сервис и контроллер импортируют их оттуда.

---

### `[MINOR]` Дублирование `AuthResponse`/`LogoutResponse` в тест-файле — НОВОЕ

**Файл:** `src/modules/auth/__tests__/auth.controller.spec.ts:9-15`

Интерфейсы переопределены локально в спеке, хотя уже существуют в `src/modules/interface/auth-module-types.ts`.

```ts
interface AuthResponse { accessToken: string; }
interface LogoutResponse { logout: boolean; }
```

**Исправление:** `import { AuthResponse, LogoutResponse } from '../../interface/auth-module-types';`

---

### `[MAJOR]` Опечатка в названии метода `gtUserProfile` — НОВОЕ

**Файл:** `src/modules/user/user.service.ts:30`

```ts
public async gtUserProfile(id: string) {
```

Пропущена буква `e` — должно быть `getUserProfile`. Используется в `user.controller.ts`.

**Исправление:** Переименовать в `getUserProfile` синхронно в сервисе и контроллере.

---

## 2. Безопасность (3/10)

Это по-прежнему самая слабая область проекта. Критические уязвимости из предыдущего ревью не исправлены.

### `[CRITICAL]` Refresh token не хранится в БД — logout можно обойти — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:21-34`, `src/modules/auth/auth.service.ts:240-243`

Модель `User` не содержит поля для хранения refresh token. Метод `logout` только очищает cookie, но сам токен остаётся криптографически валидным до истечения TTL. Если атакующий извлечёт refresh token до logout, он сможет генерировать новые access tokens неограниченно.

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH). [NestJS JWT refresh tokens](https://docs.nestjs.com/security/authentication#jwt-refresh-tokens)

```ts
// auth.service.ts:240-243 — logout только чистит cookie
logout(res: Response): LogoutResponse {
  this.sendCookie(res, 'refreshToken', new Date(0));
  return { logout: true };
}
```

**Исправление:**
1. Добавить `refreshToken String?` в модель `User` в `schema.prisma`
2. При `auth()` — хешировать и сохранять refresh token в БД
3. При `refresh()` — сравнивать с хешем в БД
4. При `logout()` — обнулять поле в БД

---

### `[CRITICAL]` `verifyAsync` не обёрнут в `try/catch` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:207`

```ts
const payload: JwtPayload = await this.jwtService.verifyAsync(refresh);
```

`verifyAsync` бросает `JsonWebTokenError`/`TokenExpiredError` из пакета `jsonwebtoken`. Без `try/catch` клиент получает 500 вместо 401.

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

**Файл:** `.env.example:11-13`

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

### `[MAJOR]` `ForbiddenException` вместо `UnauthorizedException` при логине — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:123,139`

HTTP 403 означает "нет прав", а не "неверные учётные данные" (для этого — 401). Кроме того, `@ApiResponse` в контроллере документирует статус 403.

> **Правило `error-throw-http-exceptions`** (NestJS Best Practices, HIGH). [RFC 7235](https://datatracker.ietf.org/doc/html/rfc7235#section-3.1)

**Исправление:** `ForbiddenException` → `UnauthorizedException`. Обновить `@ApiResponse` в контроллере.

---

### `[MAJOR]` `EMAIL_PATTERN` — неэкранированная точка — НЕ ИСПРАВЛЕНО

**Файл:** `shared/regexp-pattern.ts:4`

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;
//                                       ^ — не экранирована
```

**Исправление:** `const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;`

---

### `[MAJOR]` `USER_PATTERN` допускает опасные спецсимволы — НЕ ИСПРАВЛЕНО

**Файл:** `shared/regexp-pattern.ts:6`

```ts
const USER_PATTERN = /^\S{3,20}$/;
```

`\S` матчит `<`, `>`, `"`, `'`, `/`, `\` — XSS-риск при отображении в UI.

**Исправление:** `const USER_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;`

---

### `[MAJOR]` Непрофессиональное сообщение об ошибке в `deleteUser` — НОВОЕ

**Файл:** `src/modules/user/user.service.ts:61-63`

```ts
if (user.provider === Provider.Github) {
  throw new ForbiddenException(`Функционал пока не доступен, звоните позже`);
}
```

Сообщение `"звоните позже"` — явная заглушка, которую увидит клиент. Также не обрабатывается кейс `Provider.Google`.

**Исправление:** Заменить на нейтральное сообщение: `'Удаление аккаунта для OAuth-пользователей временно недоступно'`. Добавить проверку всех provider-значений из enum.

---

### `[SUGGESTION]` Отсутствует Rate Limiting — НЕ ИСПРАВЛЕНО

Auth endpoints не защищены от brute-force атак.

> [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

---

## 3. Качество кода и чистота (5/10)

### `[RESOLVED]` `logger.log` заменён на `logger.error` в PrismaService

**Файл:** `prisma/prisma.service.ts`

Теперь используется `this.logger.error(...)` для ошибок подключения.

---

### `[MAJOR]` `findOne` — OR-запрос при логине с пустым/undefined полем — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:163-184`

При логине только с email поле `username` может быть `undefined`. Prisma пропустит это условие в OR, что корректно. Однако в тестах `username` передаётся как пустая строка `''` — Prisma выполнит поиск по `username = ''` case-insensitively.

> [Prisma — filtering](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)

**Исправление:** Разделить на `findByEmail` и `findByUsername`.

---

### `[MAJOR]` `logout` передаёт имя cookie как значение токена — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:241`

```ts
this.sendCookie(res, 'refreshToken', new Date(0));
//                   ^^^^^^^^^^^^^ — имя cookie передаётся как значение
```

`sendCookie(res, token, expires)` — второй аргумент это значение, а не имя.

**Исправление:** `this.sendCookie(res, '', new Date(0));`

---

### `[MAJOR]` `BCRYPT_SALT` — нет проверки на `NaN` после коерсии — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:40`, `src/modules/user/user.service.ts:20,25,145`

В `AuthService`: `configService.getOrThrow<number>('BCRYPT_SALT')` — дженерик не выполняет конвертации, возвращается строка. Коерсия `+this.SALT` без валидации: если `BCRYPT_SALT=abc` → `NaN` → `genSalt(NaN)` вызовет непредвиденную ошибку.

В `UserService`: `SALT` явно объявлен как `string` (строка 20), что несовместимо с `AuthService`, где тот же паттерн с `<number>`.

```ts
// user.service.ts:20
private readonly SALT: string;  // объявлен как строка
// ...
const salts = await genSalt(+this.SALT);  // строка 145
```

**Исправление:**
```ts
const raw = configService.getOrThrow<string>('BCRYPT_SALT');
const salt = parseInt(raw, 10);
if (Number.isNaN(salt) || salt < 10 || salt > 31) {
  throw new Error(`BCRYPT_SALT must be a number between 10 and 31, got: "${raw}"`);
}
this.SALT = salt;
```

---

### `[MINOR]` Неиспользуемый импорт `Request` в `user.service.ts` — НОВОЕ

**Файл:** `src/modules/user/user.service.ts:8`

```ts
import { Request } from 'express';
```

`Request` нигде не используется в файле.

**Исправление:** Удалить импорт.

---

### `[MINOR]` `main.ts:47` — неверный тип-дженерик `<number>` для `DEV_HOST` — НЕ ИСПРАВЛЕНО

**Файл:** `src/main.ts:47`

```ts
const host = config.getOrThrow<number>('DEV_HOST'); // DEV_HOST — строка URL
```

**Исправление:** `config.getOrThrow<string>('DEV_HOST')`

---

## 4. Обработка ошибок (4/10)

### `[CRITICAL]` `refresh()` не ловит ошибку `jwtService.verifyAsync` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:207`

(см. раздел 2 — Безопасность)

---

### `[MAJOR]` Race condition TOCTOU — `prisma.user.create` без `try/catch` для P2002 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts`

Предварительная проверка через `findOne` + `ConflictException` не защищает от конкурентных запросов. `prisma.user.create` не обёрнут в `try/catch`.

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

### `[SUGGESTION]` Отсутствует глобальный Exception Filter — НЕ ИСПРАВЛЕНО

> [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

---

## 5. База данных и Prisma (5/10)

### `[MAJOR]` Отсутствует `url` в `datasource db` — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:6-8`

```prisma
datasource db {
  provider = "postgresql"
  // url отсутствует
}
```

Prisma CLI-команды (`prisma migrate dev`, `prisma studio`) не знают, к какой БД подключаться.

**Исправление:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### `[SUGGESTION]` Модель `User` не имеет поля для хранения refresh token — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:21-34`

Необходимо для реализации корректного logout (см. раздел 2). Добавить: `refreshToken String?`

---

## 6. Тестирование (6/10)

### `[MINOR]` Тест `verifyAsync` мокает `UnauthorizedException` вместо `JsonWebTokenError` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:210`

```ts
(jwtService.verifyAsync as jest.Mock).mockRejectedValue(
  new UnauthorizedException('Invalid token'), // должен быть JsonWebTokenError
);
```

Маскирует отсутствие `try/catch` — тест "проходит", но реальный код сломается.

**Исправление:**
```ts
import { JsonWebTokenError } from 'jsonwebtoken';
(jwtService.verifyAsync as jest.Mock).mockRejectedValue(
  new JsonWebTokenError('invalid token'),
);
```

---

### `[MINOR]` Тест `logout` закрепляет некорректное поведение как ожидаемое — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:255-262`

```ts
expect(responseMock.cookie).toHaveBeenCalledWith(
  'refreshToken',
  'refreshToken', // имя cookie передаётся как значение — это баг
  expect.objectContaining({ ... }),
);
```

**Исправление:** После исправления `logout()` обновить тест — ожидать `''` вторым аргументом.

---

### `[SUGGESTION]` E2E тест проверяет несуществующий маршрут `GET /` — НЕ ИСПРАВЛЕНО

**Файл:** `test/app.e2e-spec.ts`

Шаблонный код из `nest generate`. Тест упадёт против реального приложения.

**Исправление:** Заменить на реальные E2E тесты auth flow.

---

### `[SUGGESTION]` Добавить тест на `githubOAuth` — upsert без обработки P2002 — НОВОЕ

**Файл:** `src/modules/auth/auth.service.ts:93-106`

При GitHub OAuth `upsert` с username из профиля не обрабатывает конфликт P2002, если другой пользователь занял это имя.

---

## 7. Конфигурация и DevOps (5/10)

### `[RESOLVED]` `app.enableShutdownHooks()` добавлен

**Файл:** `src/main.ts:48`

`PrismaService.OnModuleDestroy` теперь будет корректно вызываться при SIGTERM.

---

### `[RESOLVED]` Дублирующиеся зависимости `bcrypt` и `bcrypt-ts` устранены

Код использует только `bcrypt-ts`.

---

### `[MAJOR]` `@nestjs/mapped-types: "*"` — неограниченная версия — НЕ ИСПРАВЛЕНО

**Файл:** `package.json:37`

**Исправление:** `"@nestjs/mapped-types": "^2.0.6"`

---

### `[MINOR]` `tsconfig.json` — `noImplicitAny: false` снижает типобезопасность — НЕ ИСПРАВЛЕНО

**Файл:** `tsconfig.json`

> [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig#noImplicitAny)

---

### `[MINOR]` ESLint — `no-floating-promises` и `no-unsafe-argument` как `warn` — НЕ ИСПРАВЛЕНО

CI без `--max-warnings=0` не ломает билд на предупреждениях.

---

## 8. API дизайн и документация (7/10)

Swagger интегрирован, CORS настроен, документация доступна на `/docs` и `/openapi.yaml`.

### `[MINOR]` Swagger `addBearerAuth()`, но ни один endpoint не использует `@ApiBearerAuth()` — НЕ ИСПРАВЛЕНО

**Файл:** `src/main.ts`

---

### `[MINOR]` `@ApiResponse` для login документирует 403 вместо 401 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.controller.ts`

```ts
@ApiResponse({ status: 403, description: 'Неверные учётные данные' })
```

После исправления `ForbiddenException` → `UnauthorizedException` обновить на `status: 401`.

---

## 9. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Добавить `refreshToken String?` в `schema.prisma` + хранить хеш в БД при login/refresh + обнулять при logout
- [ ] Обернуть `verifyAsync` в `try/catch` → бросать `UnauthorizedException`
- [ ] Заменить credentials в `.env.example` на плейсхолдеры
- [ ] Экранировать точку в `EMAIL_PATTERN` → `\.[^\s@]{2,}$`
- [ ] Добавить `url = env("DATABASE_URL")` в `datasource db` в `schema.prisma`

### Приоритет 2 (важно)
- [ ] Заменить `ForbiddenException` → `UnauthorizedException` при логине + обновить `@ApiResponse`
- [ ] Исправить сообщение в `deleteUser` для OAuth-пользователей
- [ ] Переименовать `gtUserProfile` → `getUserProfile`
- [ ] Добавить `parseInt` + `Number.isNaN` для `BCRYPT_SALT`
- [ ] Исправить `logout()` — передавать `''` вместо `'refreshToken'` + обновить тест
- [ ] Зафиксировать версию `@nestjs/mapped-types`
- [ ] Ограничить `USER_PATTERN` до `[a-zA-Z0-9_-]`
- [ ] Добавить Rate Limiting на auth endpoints

### Приоритет 3 (желательно)
- [ ] Обернуть `prisma.user.create` в `try/catch` для P2002
- [ ] Удалить неиспользуемый импорт `Request` в `user.service.ts`
- [ ] Включить `noImplicitAny: true` в tsconfig
- [ ] Поднять ESLint warnings до errors
- [ ] Исправить мок в тесте `refresh` — использовать `JsonWebTokenError`
- [ ] Заменить шаблонный E2E тест на реальные тесты auth flow
- [ ] Удалить дублирование интерфейсов в `auth.controller.spec.ts`

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| NestJS Authentication | https://docs.nestjs.com/security/authentication |
| NestJS JWT refresh tokens | https://docs.nestjs.com/security/authentication#jwt-refresh-tokens |
| NestJS Guards | https://docs.nestjs.com/guards |
| NestJS Exception Filters | https://docs.nestjs.com/exception-filters |
| NestJS Configuration | https://docs.nestjs.com/techniques/configuration |
| NestJS Rate Limiting | https://docs.nestjs.com/security/rate-limiting |
| NestJS Versioning | https://docs.nestjs.com/techniques/versioning |
| NestJS Testing | https://docs.nestjs.com/fundamentals/testing |
| NestJS Lifecycle Events | https://docs.nestjs.com/fundamentals/lifecycle-events |
| Prisma Error Handling | https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors |
| RFC 7235 — 401 vs 403 | https://datatracker.ietf.org/doc/html/rfc7235#section-3.1 |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 5.5/10 | 4 | 8 | 6 |
| 2026-03-09 | 6.0/10 | 4 | 9 | 6 |
| 2026-03-16 | 6.0/10 | 3 | 8 | 5 |
