# Backend Code Review — MeowVault

## Дата ревью: 2026-03-09

## Общая оценка: 6.0/10

Относительно предыдущего ревью: исправлена обработка ошибок в `signIn` (P2002 — частично через `ConflictException`), добавлены новые тесты (controller, jwt.config, login-auth.dto), появился util `isDev`. Критические уязвимости безопасности остаются нетронутыми — refresh token не сохраняется в БД, `verifyAsync` не обёрнут в `try/catch`, `.env.example` содержит реальные credentials.

> **Источники best practices:** [NestJS Official Docs](https://docs.nestjs.com), [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors), NestJS Best Practices Skill (40 rules, 10 categories)

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 6/10 | Есть замечания | = |
| 2. Безопасность | 3/10 | Критические проблемы | = |
| 3. Качество кода и чистота | 6/10 | Есть замечания | ↑ |
| 4. Обработка ошибок | 4/10 | Существенные замечания | = |
| 5. База данных и Prisma | 5/10 | Существенные замечания | = |
| 6. Тестирование | 7/10 | Есть замечания | ↑ |
| 7. Конфигурация и DevOps | 4/10 | Существенные замечания | = |
| 8. API дизайн и документация | 7/10 | Мелкие замечания | = |

---

## 1. Архитектура и структура проекта (6/10)

Модульная структура NestJS реализована правильно: `PrismaModule` как глобальный модуль, `AuthModule` с отдельным сервисом и контроллером. DTO, интерфейсы, утилиты — структурированы корректно.

> **Правило `arch-feature-modules`** (NestJS Best Practices, CRITICAL): Организация по фичам, а не по техническим слоям. Проект следует этому правилу.

### `[MAJOR]` Дублирование интерфейсов `AuthResponse` и `LogoutResponse`

**Файл:** `src/modules/auth/auth.service.ts:27-33` и `src/modules/auth/auth.controller.ts:16-22`

Статус: **Не исправлено.** Интерфейсы `AuthResponse` и `LogoutResponse` определены идентично в двух файлах. Это нарушение DRY и потенциальный источник рассинхронизации.

> **Правило `api-use-dto-serialization`** (NestJS Best Practices, MEDIUM): DTO и response-типы должны быть определены в отдельных файлах и переиспользоваться через imports. [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)

```ts
// auth.service.ts:27-33
interface AuthResponse { accessToken: string; }
interface LogoutResponse { logout: boolean; }

// auth.controller.ts:16-22 — идентичное определение
interface AuthResponse { accessToken: string; }
interface LogoutResponse { logout: boolean; }
```

**Исправление:** Вынести в `src/modules/auth/interfaces/auth-response.interface.ts` и импортировать в обоих местах. Рассмотреть `class` вместо `interface` для поддержки `@ApiProperty()`.

---

### `[MAJOR]` Метод `signIn` назван как "вход", но выполняет "регистрацию"

**Файл:** `src/modules/auth/auth.service.ts:58`, `src/modules/auth/auth.controller.ts:34`

Статус: **Не исправлено.** Метод `signIn` в `AuthService` по-прежнему выполняет регистрацию. Контроллер использует имя `create`. В тест-файле это задокументировано как `create (register)`, что говорит о понимании проблемы, но не о её исправлении.

> **Правило `arch-single-responsibility`** (NestJS Best Practices, CRITICAL): Имя метода должно отражать его назначение.

```ts
// auth.service.ts:58 — регистрация, но называется signIn
async signIn(res: Response, dto: CreateAuthDto): Promise<AuthResponse>

// auth.controller.ts:34 — endpoint POST /auth/register называется create
create(@Body() createAuthDto: CreateAuthDto, ...): Promise<AuthResponse> {
  return this.authService.signIn(res, createAuthDto);
}
```

**Исправление:** Переименовать `signIn` → `register` в сервисе, `create` → `register` в контроллере.

---

### `[SUGGESTION]` Отсутствует глобальный AuthGuard

Статус: **Не исправлено.** Актуально при расширении API — защищённые маршруты потребуют ручного добавления Guard на каждый endpoint.

> **Правило `security-use-guards`** (NestJS Best Practices, HIGH). [NestJS Authentication](https://docs.nestjs.com/security/authentication)

---

## 2. Безопасность (3/10)

Это по-прежнему самая слабая область проекта. Критические уязвимости из предыдущего ревью не исправлены.

### `[CRITICAL]` Refresh token не хранится в БД — logout можно обойти

**Файл:** `src/modules/auth/auth.service.ts:117-124`, `203-207`

Статус: **Не исправлено.** В модели `User` (`prisma/schema.prisma`) по-прежнему нет поля для хранения refresh token. Метод `logout` только очищает cookie, но сам токен остаётся криптографически валидным до истечения (7 дней). Если атакующий извлечёт refresh token до вызова logout, он сможет генерировать новые access tokens неограниченно.

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH)

```ts
// auth.service.ts:203-207 — logout только чистит cookie
logout(res: Response): LogoutResponse {
  this.sendCookie(res, 'refreshToken', new Date(0));
  return { logout: true };
}
```

**Исправление:**
1. Добавить `refreshToken String?` в модель `User` в `schema.prisma`
2. При вызове `auth()` — хешировать и сохранять refresh token в БД
3. При `refresh()` — сравнивать хеш из cookie с хешем в БД
4. При `logout()` — обнулять поле в БД

---

### `[CRITICAL]` `BCRYPT_SALT` читается как строка, но объявлен как число

**Файл:** `src/modules/auth/auth.service.ts:37,46,66`

Статус: **Не исправлено.** `ConfigService.getOrThrow<number>` не выполняет runtime-преобразование. Дженерик `<number>` — только TypeScript-подсказка. Коерсия `+this.SALT` (строка 66) не защищена: `BCRYPT_SALT=abc` даст `NaN`.

```ts
private readonly SALT: number;
this.SALT = configService.getOrThrow<number>('BCRYPT_SALT'); // реально строка из env!
const salts = await genSalt(+this.SALT);                     // коерсия без валидации
```

**Исправление:**
```ts
const raw = configService.getOrThrow<string>('BCRYPT_SALT');
this.SALT = parseInt(raw, 10);
if (isNaN(this.SALT) || this.SALT < 10 || this.SALT > 31) {
  throw new Error(`BCRYPT_SALT must be a number between 10 and 31, got: "${raw}"`);
}
```

---

### `[CRITICAL]` `.env.example` содержит реальные credentials и слабый JWT secret

**Файл:** `.env.example:15,24`

Статус: **Не исправлено.**

```
DEVELOPMENT_POSTGRES=postgresql://postgres:123456@localhost:5433/postgresql
JWT_SECRET_KEY=sss12345678910
```

**Исправление:** Заменить на плейсхолдеры:
```
DEVELOPMENT_POSTGRES=postgresql://<user>:<password>@localhost:5433/<db_name>
JWT_SECRET_KEY=<your-strong-random-secret-min-32-chars>
```

---

### `[MAJOR]` `EMAIL_PATTERN` — неэкранированная точка пропускает невалидные email

**Файл:** `shared/regexp-pattern.ts:4`

Статус: **Не исправлено.**

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;
//                                       ^ — не экранирована
```

Точка `.` матчит любой символ. `user@exampleXcom` пройдёт валидацию.

**Исправление:** `const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;`

---

### `[MAJOR]` `USER_PATTERN` допускает опасные спецсимволы в username

**Файл:** `shared/regexp-pattern.ts:6`

Статус: **Не исправлено.**

```ts
const USER_PATTERN = /^\S{3,20}$/;
```

`\S` матчит `<`, `>`, `"`, `'`, `/`, `\` — XSS-риск при отображении в UI.

**Исправление:** `const USER_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;`

---

### `[MAJOR]` Login возвращает `ForbiddenException` (403) вместо `UnauthorizedException` (401)

**Файл:** `src/modules/auth/auth.service.ts:95,103`

Статус: **Не исправлено.** HTTP 403 означает "нет прав", а не "неверные учётные данные".

> **Правило `error-throw-http-exceptions`** (NestJS Best Practices, HIGH)

```ts
throw new ForbiddenException(`Пользователь не существует или неверный пароль`);
```

**Исправление:** `ForbiddenException` → `UnauthorizedException`. Обновить `@ApiResponse` в контроллере: `status: 403` → `status: 401`.

---

### `[SUGGESTION]` Отсутствует Rate Limiting

Статус: **Не исправлено.** Auth endpoints не защищены от brute-force атак.

> **Правило `security-rate-limiting`** (NestJS Best Practices, HIGH). [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

---

## 3. Качество кода и чистота (6/10)

### `[MAJOR]` `findOne` использует `OR [email, username]` — потенциальные ложные совпадения при логине

**Файл:** `src/modules/auth/auth.service.ts:126-147`

Статус: **Не исправлено.** При логине только с email поле `dto.username` будет `""`. Prisma включит `username: { equals: '', mode: 'insensitive' }` в OR-запрос.

```ts
return await this.prisma.user.findFirst({
  where: {
    OR: [
      { email: { equals: dto.email, mode: 'insensitive' } },
      { username: { equals: dto.username, mode: 'insensitive' } },
    ],
  },
});
```

**Исправление:** Для логина — условный запрос в зависимости от переданного поля. Для регистрации — проверять email и username отдельно.

---

### `[MINOR]` `logout` передаёт имя cookie как значение token

**Файл:** `src/modules/auth/auth.service.ts:204`

Статус: **Не исправлено.** Тест на строке 300-308 `auth.service.spec.ts` подтверждает баг как ожидаемое поведение.

```ts
this.sendCookie(res, 'refreshToken', new Date(0));
//                   ^^^^^^^^^^^^^ — имя cookie, а не значение
```

**Исправление:** `this.sendCookie(res, '', new Date(0));`

---

### `[MINOR]` `main.ts:46` — неверный тип-дженерик `<number>` для `DEV_HOST`

**Файл:** `src/main.ts:46`

Статус: **Не исправлено.**

```ts
const host = config.getOrThrow<number>('DEV_HOST'); // DEV_HOST — строка URL
```

**Исправление:** `config.getOrThrow<string>('DEV_HOST')`

---

### `[MINOR]` `prisma.service.ts` — ошибки логируются на уровне INFO

**Файл:** `prisma/prisma.service.ts:36,45`

Статус: **Не исправлено.**

```ts
this.logger.log(`Fail to connect ${error}`);
this.logger.log(`Fail to disconnect ${error}`);
```

**Исправление:** `this.logger.error('Fail to connect', error);`

---

### `[RESOLVED]` Обработка P2002 при регистрации — частично

Добавлена предварительная проверка `findOne` перед `create` и выброс `ConflictException`. Однако **race condition TOCTOU остаётся**: `prisma.user.create` не обёрнут в `try/catch` для `P2002`.

**Полное исправление:**
```ts
try {
  const user = await this.prisma.user.create({ data: { ... } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('Пользователь уже существует');
  }
  throw error;
}
```

---

## 4. Обработка ошибок (4/10)

### `[CRITICAL]` `refresh()` не ловит ошибку `jwtService.verifyAsync`

**Файл:** `src/modules/auth/auth.service.ts:170`

Статус: **Не исправлено.** `verifyAsync` бросает `JsonWebTokenError`/`TokenExpiredError` — без `try/catch` клиент получает 500 вместо 401.

```ts
// Строка 170 — нет try/catch!
const payload: JwtPayload = await this.jwtService.verifyAsync(refresh);
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

### `[MAJOR]` Race condition TOCTOU в `signIn` — необработанный P2002 при конкурентных запросах

**Файл:** `src/modules/auth/auth.service.ts:58-88`

Статус: **Частично исправлено** (см. раздел 3). `prisma.user.create` не обёрнут в `try/catch`.

---

### `[SUGGESTION]` Отсутствует глобальный Exception Filter

Статус: **Не исправлено.**

> **Правило `error-use-exception-filters`** (NestJS Best Practices, HIGH). [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

---

## 5. База данных и Prisma (5/10)

### `[MAJOR]` Отсутствует `url` в `datasource db` — Prisma CLI не сможет работать

**Файл:** `prisma/schema.prisma:6-8`

Статус: **Не исправлено.**

```prisma
datasource db {
  provider = "postgresql"
  // url отсутствует
}
```

**Исправление:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### `[SUGGESTION]` Модель `User` не имеет поля для хранения refresh token

**Файл:** `prisma/schema.prisma:15-25`

Статус: **Не исправлено.** Необходимо для корректного logout (см. раздел 2).

---

## 6. Тестирование (7/10)

С предыдущего ревью добавлены новые тест-файлы: `auth.controller.spec.ts`, `jwt.config.spec.ts`, `login-auth.dto.spec.ts`. Покрытие существенно выросло.

### `[MINOR]` Тест `refresh` мокает `verifyAsync` с `UnauthorizedException`, а не с `JsonWebTokenError`

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:254`

Статус: **Не исправлено.** Маскирует баг из пункта 4.1 — тест "проходит", но реальный код не обрабатывает настоящие ошибки JWT.

```ts
(jwtService.verifyAsync as jest.Mock).mockRejectedValue(
  new UnauthorizedException('Invalid token'), // должен быть JsonWebTokenError
);
```

**Исправление:**
```ts
import { JsonWebTokenError } from 'jsonwebtoken';
(jwtService.verifyAsync as jest.Mock).mockRejectedValue(
  new JsonWebTokenError('invalid token'),
);
```

---

### `[MINOR]` Тест `logout` подтверждает некорректное поведение как ожидаемое

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts:300-308`

Статус: **Новое.**

```ts
expect(mockResponse.cookie).toHaveBeenCalledWith(
  'refreshToken',
  'refreshToken', // имя cookie передаётся как значение — это баг
  expect.objectContaining({ ... }),
);
```

**Исправление:** После исправления `logout()` обновить тест — ожидать `''` вторым аргументом.

---

### `[SUGGESTION]` E2E тест проверяет `GET /` — несуществующий маршрут

**Файл:** `test/app.e2e-spec.ts:19-23`

Статус: **Новое.** Шаблонный код из `nest generate`, тест упадёт при запуске против реального приложения.

```ts
it('/ (GET)', () => {
  return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
});
```

**Исправление:** Заменить на реальные E2E тесты: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.

---

### `[SUGGESTION]` Добавить тесты для edge cases

- Регистрация при гонке (P2002 из `prisma.user.create`)
- Refresh с истёкшим токеном (реальный `TokenExpiredError`)
- Валидация regex-паттернов с граничными значениями

---

## 7. Конфигурация и DevOps (4/10)

### `[MAJOR]` `.env.example` — дублирующиеся ключи и JS-комментарии

**Файл:** `.env.example`

Статус: **Не исправлено.**

- `PORT` определён дважды (строки 4 и 10)
- `HOST` определён дважды (строки 5 и 11)
- Строки 14 и 20 используют `//` — `dotenv` поддерживает только `#`
- Отсутствует `DATABASE_URL`

**Исправление:** Дедуплицировать ключи, использовать `#`, добавить `DATABASE_URL`. Реализовать валидацию через `ConfigModule.forRoot({ validationSchema })`.

---

### `[MAJOR]` `bcrypt` и `bcrypt-ts` — дублирующиеся зависимости

**Файл:** `package.json:42-43`

Статус: **Не исправлено.** Код использует только `bcrypt-ts`. Пакет `bcrypt` — нативный C++ аддон, замедляет `npm ci`.

```json
"bcrypt": "^6.0.0",
"bcrypt-ts": "^8.0.1",
```

**Исправление:** Удалить `bcrypt` из `dependencies`.

---

### `[MAJOR]` `@nestjs/mapped-types: "*"` — неограниченная версия

**Файл:** `package.json:37`

Статус: **Не исправлено.**

**Исправление:** `"@nestjs/mapped-types": "^2.0.6"`

---

### `[MINOR]` `tsconfig.json` — `noImplicitAny: false` снижает типобезопасность

Статус: **Не исправлено.**

---

### `[MINOR]` ESLint — `no-floating-promises` и `no-unsafe-argument` как `warn`

Статус: **Не исправлено.** CI без `--max-warnings=0` не ломает билд на предупреждениях.

**Исправление:** Поднять до `'error'` или добавить `--max-warnings=0` в `ci:lint`.

---

### `[SUGGESTION]` `app.enableShutdownHooks()` отсутствует в `main.ts`

**Файл:** `src/main.ts`

Статус: **Новое.** `PrismaService` реализует `OnModuleDestroy`, но NestJS не будет перехватывать SIGTERM без этого вызова.

```ts
// main.ts — добавить перед app.listen()
app.enableShutdownHooks();
```

---

## 8. API дизайн и документация (7/10)

Swagger интегрирован, есть `@ApiOperation`, `@ApiResponse`, `@ApiBody`. Документация по `/docs` и `/openapi.yaml`. CORS настроен с поддержкой Netlify deploy previews.

### `[MINOR]` Swagger добавляет `Bearer Auth`, но ни один endpoint его не требует

**Файл:** `src/main.ts:32`

Статус: **Не исправлено.** `addBearerAuth()` добавляет схему, но ни один контроллер не использует `@ApiBearerAuth()`.

---

### `[MINOR]` `@ApiResponse` для login документирует 403 вместо 401

**Файл:** `src/modules/auth/auth.controller.ts:44`

Статус: **Новое.** После исправления `ForbiddenException` → `UnauthorizedException` нужно обновить документацию.

```ts
@ApiResponse({ status: 403, description: 'Неверные учётные данные' })
// исправить на:
@ApiResponse({ status: 401, description: 'Неверные учётные данные' })
```

---

### `[SUGGESTION]` Добавить версионирование API (`/api/v1/auth/...`)

Статус: **Не исправлено.**

> **Правило `api-versioning`** (NestJS Best Practices, MEDIUM). [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)

---

## 9. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Исправить хранение refresh token в БД + отзыв при logout (`security-auth-jwt`)
- [ ] Добавить `try/catch` в `refresh()` для `verifyAsync` (`error-handle-async-errors`)
- [ ] Обернуть `prisma.user.create` в `try/catch` для `P2002` (`error-use-exception-filters`)
- [ ] Исправить `EMAIL_PATTERN` — экранировать точку (`security-validate-all-input`)
- [ ] Заменить credentials в `.env.example` на плейсхолдеры + добавить `DATABASE_URL`
- [ ] Добавить `url = env("DATABASE_URL")` в `schema.prisma`

### Приоритет 2 (важно)
- [ ] Переименовать `signIn` → `register` в сервисе и `create` → `register` в контроллере
- [ ] Вынести `AuthResponse`/`LogoutResponse` в общий файл
- [ ] Удалить дублирующий пакет `bcrypt` из `dependencies`
- [ ] Зафиксировать версию `@nestjs/mapped-types`
- [ ] Заменить `ForbiddenException` → `UnauthorizedException` + обновить `@ApiResponse`
- [ ] Исправить логику `findOne` для раздельной проверки email/username при логине
- [ ] Дедуплицировать `.env.example` + добавить валидацию env с Joi
- [ ] Добавить Rate Limiting на auth endpoints
- [ ] Исправить `logout()` — передавать `''` вместо `'refreshToken'` + обновить тест
- [ ] Заменить шаблонный E2E тест на реальные тесты auth flow

### Приоритет 3 (желательно)
- [ ] Включить `noImplicitAny: true` в tsconfig
- [ ] Поднять ESLint warnings до errors или добавить `--max-warnings=0`
- [ ] Исправить `logger.log` → `logger.error` в PrismaService
- [ ] Ограничить `USER_PATTERN` до `[a-zA-Z0-9_-]`
- [ ] Добавить `app.enableShutdownHooks()` в `main.ts`
- [ ] Исправить мок в тесте `refresh` — использовать `JsonWebTokenError`
- [ ] Создать глобальный `AuthGuard` с `@Public()` декоратором

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| NestJS Authentication | https://docs.nestjs.com/security/authentication |
| NestJS Guards | https://docs.nestjs.com/guards |
| NestJS Exception Filters | https://docs.nestjs.com/exception-filters |
| NestJS Configuration | https://docs.nestjs.com/techniques/configuration |
| NestJS Rate Limiting | https://docs.nestjs.com/security/rate-limiting |
| NestJS Versioning | https://docs.nestjs.com/techniques/versioning |
| NestJS Testing | https://docs.nestjs.com/fundamentals/testing |
| NestJS Lifecycle Events | https://docs.nestjs.com/fundamentals/lifecycle-events |
| Prisma Error Handling | https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors |
| Prisma + NestJS Exception Filter | https://www.prisma.io/blog/nestjs-prisma-error-handling |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 5.5/10 | 4 | 8 | 6 |
| 2026-03-09 | 6.0/10 | 4 | 9 | 6 |
