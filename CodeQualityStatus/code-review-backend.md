# Backend Code Review — MeowVault

## Дата ревью: 2026-03-19

## Общая оценка: 5.5/10

С предыдущего ревью (2026-03-16): исправлены `EMAIL_PATTERN` (экранирована точка) и `USER_PATTERN` (ограничен безопасными символами). Появился новый модуль `KeyStorageModule` с CRUD-операциями для key-value хранилища, что расширяет функциональность. Однако `KeyStorageController` помечен `@Public()` целиком — `POST` и `DELETE` эндпоинты доступны без аутентификации. В `refresh()` не передаётся `provider` в новый JWT-payload, что может ломать авторизацию после обновления токена. Остальные критические и мажорные замечания из предыдущих ревью не тронуты.

> **Источники best practices:** [NestJS Official Docs](https://docs.nestjs.com), [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors), NestJS Best Practices Skill

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 7/10 | Мелкие замечания | = |
| 2. Безопасность | 2/10 | Критические проблемы | ↓ |
| 3. Качество кода и чистота | 5/10 | Существенные замечания | = |
| 4. Обработка ошибок | 4/10 | Существенные замечания | = |
| 5. База данных и Prisma | 5/10 | Существенные замечания | = |
| 6. Тестирование | 6/10 | Есть замечания | = |
| 7. Конфигурация и DevOps | 5/10 | Есть замечания | = |
| 8. API дизайн и документация | 6/10 | Есть замечания | ↓ |

---

## 1. Архитектура и структура проекта (7/10)

Появился `KeyStorageModule` с контроллером, сервисом, DTOs и Swagger-документацией — хорошая модульная структура. Глобальный `JwtAuthGuard` по-прежнему на месте.

### `[RESOLVED]` `EMAIL_PATTERN` — точка экранирована

**Файл:** `shared/regexp-pattern.ts:4`

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

---

### `[RESOLVED]` `USER_PATTERN` — ограничен безопасными символами

**Файл:** `shared/regexp-pattern.ts:6`

```ts
const USER_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;
```

---

### `[MINOR]` Дублирование `AuthResponse`/`LogoutResponse` в тест-файле — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.controller.spec.ts:9-15`

Интерфейсы переопределены локально в спеке, хотя уже существуют в `src/modules/interface/auth-module-types.ts`.

**Исправление:** `import { AuthResponse, LogoutResponse } from '../../interface/auth-module-types';`

---

### `[MAJOR]` Опечатка в названии метода `gtUserProfile` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:30`

```ts
public async gtUserProfile(id: string) {
```

**Исправление:** Переименовать в `getUserProfile` синхронно в сервисе и контроллере.

---

### `[MINOR]` Опечатка в названии файла `update-avater.dto.ts` — НОВОЕ

**Файл:** `src/modules/user/dto/update-avater.dto.ts`

> Конвенция именования: [NestJS Style Guide](https://docs.nestjs.com/first-steps)

`avater` вместо `avatar`. Используется в импортах `user.service.ts:16` и `user.controller.ts`.

**Исправление:** Переименовать файл в `update-avatar.dto.ts` и обновить импорты.

---

## 2. Безопасность (2/10)

Самая слабая область. Критические уязвимости кочуют из ревью в ревью, добавлена новая — `KeyStorageController` полностью открыт.

### `[CRITICAL]` `KeyStorageController` полностью открыт без аутентификации — НОВОЕ

**Файл:** `src/modules/key-storage/key-storage.controller.ts:23`

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH): `@Public()` снимает JWT-защиту — применять только к действительно публичным ресурсам. [NestJS — Enable authentication globally](https://docs.nestjs.com/security/authentication#enable-authentication-globally)

Декоратор `@Public()` применён на весь контроллер. `POST /key-storage` (upsert) и `DELETE /key-storage` доступны анонимно — любой может перезаписывать или удалять данные.

```ts
@Public()
@ApiTags('Key Storage')
@Controller('key-storage')
export class KeyStorageController {
```

**Исправление:** Убрать `@Public()` с уровня класса. Оставить `@Public()` только на `GET`-эндпоинтах, если они действительно публичные.

---

### `[CRITICAL]` Refresh token не хранится в БД — logout можно обойти — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:21-34`, `src/modules/auth/auth.service.ts:240-243`

Модель `User` не содержит поля для хранения refresh token. `logout()` только очищает cookie, сам токен остаётся валидным до истечения TTL.

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH). [NestJS JWT refresh tokens](https://docs.nestjs.com/security/authentication#jwt-refresh-tokens)

**Исправление:**
1. Добавить `refreshToken String?` в модель `User`
2. При `auth()` — хешировать и сохранять refresh token в БД
3. При `refresh()` — сравнивать с хешем в БД
4. При `logout()` — обнулять поле в БД

---

### `[CRITICAL]` `verifyAsync` не обёрнут в `try/catch` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:207`

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

### `[CRITICAL]` `githubOauth` — upsert без обработки P2002 — НОВОЕ

**Файл:** `src/modules/auth/auth.service.ts:93-106`

> **Правило** (Prisma Error Handling, HIGH): [Prisma Error Reference — P2002](https://www.prisma.io/docs/orm/reference/error-reference#p2002)

`upsert` в блоке `update` обновляет `username` и `email` из GitHub-профиля без проверки уникальности. Если другой пользователь занял username/email — необработанный 500.

```ts
const user = await this.prisma.user.upsert({
  where: { providerId: id },
  update: {
    username: username ?? fallbackUsername,
    email: emails?.[0]?.value ?? fallbackEmail,
  },
  // ...
});
```

**Исправление:**
```ts
try {
  const user = await this.prisma.user.upsert({ ... });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('Пользователь с таким именем или email уже существует');
  }
  throw error;
}
```

---

### `[MAJOR]` `ForbiddenException` вместо `UnauthorizedException` при логине — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:123,139`

HTTP 403 означает "нет прав", а не "неверные учётные данные" (для этого — 401).

> **Правило `error-throw-http-exceptions`** (NestJS Best Practices, HIGH). [RFC 7235](https://datatracker.ietf.org/doc/html/rfc7235#section-3.1)

**Исправление:** `ForbiddenException` → `UnauthorizedException`. Обновить `@ApiResponse` в контроллере.

---

### `[MAJOR]` `USER_PATTERN` и `EMAIL_PATTERN` используются на бэкенде, но не на фронтенде — НЕ ИСПРАВЛЕНО

**Файл:** `shared/regexp-pattern.ts`

Паттерны определены в `shared/`, но фронтенд дублирует их в собственных файлах. Расхождение паттернов = разные правила валидации.

**Исправление:** Рассмотреть публикацию общих паттернов как shared-модуль или синхронизировать вручную.

---

### `[MAJOR]` Непрофессиональное сообщение `"звоните позже"` в `deleteUser` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:61-62`

```ts
throw new ForbiddenException(`Функционал пока не доступен, звоните позже`);
```

**Исправление:** `'Удаление аккаунта для OAuth-пользователей временно недоступно'`

---

### `[SUGGESTION]` Отсутствует Rate Limiting — НЕ ИСПРАВЛЕНО

Auth endpoints не защищены от brute-force атак.

> [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

---

## 3. Качество кода и чистота (5/10)

### `[MAJOR]` `findOne` — OR-запрос с возможным пустым/undefined полем — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:163-184`

При логине только с email поле `username` может быть `undefined`. Prisma выполнит `OR: [email: ..., username: { equals: undefined, mode: 'insensitive' }]` — это отсутствие фильтра, что может привести к неожиданному поведению.

> [Prisma — Filtering](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)

**Исправление:** Строить массив `OR` динамически, включая только заполненные поля. Или разделить на `findByEmail` и `findByUsername`.

---

### `[MAJOR]` `logout` передаёт строку `'refreshToken'` как значение cookie — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:241`

```ts
this.sendCookie(res, 'refreshToken', new Date(0));
```

`sendCookie(res, token, expires)` — второй аргумент — значение, а не имя. В cookie записывается строка `'refreshToken'` вместо пустой строки.

**Исправление:** `this.sendCookie(res, '', new Date(0));`

---

### `[MAJOR]` `BCRYPT_SALT` — нет проверки на `NaN` после коерсии — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:40`, `src/modules/user/user.service.ts:20,25,145`

В `AuthService`: `configService.getOrThrow<number>('BCRYPT_SALT')` — дженерик не конвертирует, возвращается строка. В `UserService`: `SALT` явно объявлен как `string` (строка 20). Коерсия `+this.SALT` без валидации.

**Исправление:**
```ts
const raw = configService.getOrThrow<string>('BCRYPT_SALT');
const salt = parseInt(raw, 10);
if (Number.isNaN(salt) || salt < 4 || salt > 31) {
  throw new Error(`BCRYPT_SALT must be a number between 4 and 31, got: "${raw}"`);
}
this.SALT = salt;
```

---

### `[MAJOR]` `refresh()` не передаёт `provider` в новый JWT-payload — НОВОЕ

**Файл:** `src/modules/auth/auth.service.ts:210-225`

> Логическая ошибка: при refresh `select` не включает `provider`, и `auth(res, user)` получает объект без `provider`. После refresh `provider` в JWT станет `undefined`.

```ts
const user = await this.prisma.user.findUnique({
  where: { id: payload.id },
  select: {
    id: true,
    email: true,
    username: true,
    // provider: true — отсутствует!
  },
});
return this.auth(res, user); // user без provider
```

**Исправление:** Добавить `provider: true` в `select`:
```ts
select: {
  id: true,
  email: true,
  username: true,
  provider: true,
},
```

---

### `[MAJOR]` OAuth-пользователи не отсекаются в `updateUser` и `updatePassword` — НОВОЕ

**Файл:** `src/modules/user/user.service.ts:82-157`

> Логическая уязвимость: GitHub-пользователи имеют `password: "null"` (строка по умолчанию из schema.prisma:25). `bcrypt.compare(dto.password, "null")` вернёт `false` — пользователь получит "неверный пароль" вместо "операция недоступна для OAuth".

Проверка `provider` выполняется только в `deleteUser` (строка 60), но не в `updateUser` (строка 82) и `updatePassword` (строка 122).

**Исправление:** Добавить проверку `if (user.provider !== Provider.local)` перед `compare` в обоих методах. Включить `provider` в `select`.

---

### `[MINOR]` Мёртвая ветка `throw` после `if (payload)` в `refresh()` — НОВОЕ

**Файл:** `src/modules/auth/auth.service.ts:207-228`

```ts
const payload: JwtPayload = await this.jwtService.verifyAsync(refresh);
if (payload) {         // payload всегда truthy, если verifyAsync не бросил
  // ...
  return this.auth(res, user);
}
throw new UnauthorizedException('...'); // недостижимый код
```

**Исправление:** После добавления `try/catch` убрать `if (payload)` и хвостовой `throw`.

---

### `[MINOR]` Неиспользуемый импорт `Request` в `user.service.ts` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/user/user.service.ts:8`

```ts
import { Request } from 'express';
```

**Исправление:** Удалить импорт.

---

### `[MINOR]` `main.ts:47` — неверный тип-дженерик `<number>` для `DEV_HOST` — НЕ ИСПРАВЛЕНО

**Файл:** `src/main.ts:47`

```ts
const host = config.getOrThrow<number>('DEV_HOST'); // DEV_HOST — строка URL
```

**Исправление:** `config.getOrThrow<string>('DEV_HOST')`

---

### `[MINOR]` `KeyStorageService` инжектирует `ConfigService`, но не использует — НОВОЕ

**Файл:** `src/modules/key-storage/key-storage.service.ts:10-12`

```ts
constructor(
  private readonly prisma: PrismaService,
  private readonly configService: ConfigService, // не используется
) {}
```

**Исправление:** Удалить `ConfigService` из constructor.

---

## 4. Обработка ошибок (4/10)

### `[CRITICAL]` `refresh()` не ловит ошибку `jwtService.verifyAsync` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:207`

(см. раздел 2 — Безопасность)

---

### `[MAJOR]` Race condition TOCTOU — `prisma.user.create` без `try/catch` для P2002 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.service.ts:64-73`

Предварительная проверка через `findOne` + `ConflictException` не защищает от конкурентных запросов.

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

### `[MAJOR]` `KeyStorageService.findOne` возвращает `null` вместо `NotFoundException` — НОВОЕ

**Файл:** `src/modules/key-storage/key-storage.service.ts:36-44`

> Контроллер документирует `@ApiResponse({ status: NOT_FOUND })`, но сервис возвращает `null` — клиент получит `200 null`. [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

```ts
async findOne(searchKeyStorageDto: SearchKeyStorageDto) {
  const storage = await this.prisma.storage.findUnique({ where: { key } });
  return storage; // может быть null
}
```

**Исправление:**
```ts
if (!storage) {
  throw new NotFoundException(`Запись с ключом '${key}' не найдена`);
}
return storage;
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

> [Prisma — datasource url](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#url)

**Исправление:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### `[MAJOR]` `DIRECT_URL` не задокументирована в `.env.example` — НОВОЕ

**Файл:** `prisma/prisma.service.ts:20`

```ts
const connectionString = `${configService.getOrThrow('MODE') === 'develop'
  ? configService.getOrThrow('DEVELOPMENT_POSTGRES')
  : configService.getOrThrow('DIRECT_URL')}`;
```

`DIRECT_URL` не упомянута в `.env.example` — при деплое приложение упадёт с криптичной ошибкой.

**Исправление:** Добавить `DIRECT_URL=<production-postgres-connection-string>` в `.env.example`.

---

### `[SUGGESTION]` Модель `User` не имеет поля для хранения refresh token — НЕ ИСПРАВЛЕНО

**Файл:** `prisma/schema.prisma:21-34`

(см. раздел 2 — Безопасность)

---

## 6. Тестирование (6/10)

### `[MINOR]` Тест `verifyAsync` мокает `UnauthorizedException` вместо `JsonWebTokenError` — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:210`

**Исправление:** `new JsonWebTokenError('invalid token')` вместо `new UnauthorizedException(...)`

---

### `[MINOR]` Тест `logout` закрепляет некорректное поведение — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:255-262`

Тест ожидает `'refreshToken'` как значение cookie — это баг.

**Исправление:** После исправления `logout()` обновить тест — ожидать `''` вторым аргументом.

---

### `[SUGGESTION]` E2E тест проверяет несуществующий маршрут `GET /` — НЕ ИСПРАВЛЕНО

**Файл:** `test/app.e2e-spec.ts`

---

### `[SUGGESTION]` Нет тестов для `githubOAuth` — НЕ ИСПРАВЛЕНО

---

## 7. Конфигурация и DevOps (5/10)

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

## 8. API дизайн и документация (6/10)

### `[MINOR]` Swagger `addBearerAuth()` — частично исправлено

`UserController` использует `ApiAuth` декоратор, оборачивающий `ApiBearerAuth()`. Однако имя схемы не передано явно ни в `addBearerAuth()`, ни в декоратор.

---

### `[MINOR]` `@ApiResponse` для login документирует 403 вместо 401 — НЕ ИСПРАВЛЕНО

**Файл:** `src/modules/auth/auth.controller.ts`

После исправления `ForbiddenException` → `UnauthorizedException` обновить на `status: 401`.

---

### `[MINOR]` `POST /key-storage` возвращает 201 при upsert — НОВОЕ

**Файл:** `src/modules/key-storage/key-storage.controller.ts:30`

> [RFC 9110 — 201 Created](https://www.rfc-editor.org/rfc/rfc9110#name-201-created): `201` следует возвращать только при создании. При обновлении — `200`.

`@HttpCode(HttpStatus.CREATED)` некорректен для upsert-сценария.

**Исправление:** Убрать `@HttpCode(HttpStatus.CREATED)` или разделить на `POST` (создание, 201) и `PUT` (обновление, 200).

---

## 9. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Убрать `@Public()` с `KeyStorageController` или ограничить только `GET`
- [ ] Обернуть `verifyAsync` в `try/catch` → `UnauthorizedException`
- [ ] Добавить `refreshToken String?` в `schema.prisma` + хеш в БД при login/refresh + обнулить при logout
- [ ] Заменить credentials в `.env.example` на плейсхолдеры
- [ ] Добавить `try/catch` для P2002 в `githubOauth`

### Приоритет 2 (важно)
- [ ] Добавить `provider: true` в `select` при `refresh()` + передать в payload
- [ ] `ForbiddenException` → `UnauthorizedException` при логине + обновить `@ApiResponse`
- [ ] Проверять `provider !== Provider.local` в `updateUser` и `updatePassword`
- [ ] Исправить `logout()` — передавать `''` вместо `'refreshToken'` + обновить тест
- [ ] `findOne` в key-storage — бросать `NotFoundException` при `null`
- [ ] Добавить `url = env("DATABASE_URL")` в `datasource db`
- [ ] Добавить `DIRECT_URL` в `.env.example`
- [ ] Переименовать `gtUserProfile` → `getUserProfile`
- [ ] Добавить `parseInt` + `Number.isNaN` для `BCRYPT_SALT`
- [ ] Зафиксировать версию `@nestjs/mapped-types`
- [ ] Исправить сообщение `"звоните позже"` в `deleteUser`
- [ ] Обернуть `prisma.user.create` в `try/catch` для P2002

### Приоритет 3 (желательно)
- [ ] Переименовать `update-avater.dto.ts` → `update-avatar.dto.ts`
- [ ] Удалить `ConfigService` из `KeyStorageService`
- [ ] Удалить мёртвую ветку `throw` в `refresh()`
- [ ] Удалить неиспользуемый импорт `Request` в `user.service.ts`
- [ ] Исправить мок в тесте `refresh` — `JsonWebTokenError`
- [ ] Удалить дублирование интерфейсов в `auth.controller.spec.ts`
- [ ] Включить `noImplicitAny: true` в tsconfig
- [ ] Поднять ESLint warnings до errors
- [ ] Убрать `@HttpCode(HttpStatus.CREATED)` с upsert endpoint
- [ ] Заменить шаблонный E2E тест на реальные тесты auth flow
- [ ] Rate Limiting на auth endpoints

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| NestJS Authentication | https://docs.nestjs.com/security/authentication |
| NestJS JWT refresh tokens | https://docs.nestjs.com/security/authentication#jwt-refresh-tokens |
| NestJS Guards / @Public() | https://docs.nestjs.com/security/authentication#enable-authentication-globally |
| NestJS Exception Filters | https://docs.nestjs.com/exception-filters |
| NestJS Rate Limiting | https://docs.nestjs.com/security/rate-limiting |
| Prisma Error Reference P2002 | https://www.prisma.io/docs/orm/reference/error-reference#p2002 |
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
