# Backend Code Review — MeowVault

## Дата ревью: 2026-03-09

## Общая оценка: 5.5/10

Проект демонстрирует правильное понимание архитектуры NestJS и использование Prisma. Модульная структура корректна, реализован auth-flow с JWT + httpOnly cookie. Однако присутствуют критические проблемы безопасности и несколько архитектурных ошибок, которые необходимо исправить перед любым деплоем.

> **Источники best practices:** [NestJS Official Docs](https://docs.nestjs.com), [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors), NestJS Best Practices Skill (40 rules, 10 categories)

## Сводная таблица оценок

| Категория | Оценка | Статус |
|-----------|--------|--------|
| 1. Архитектура и структура проекта | 6/10 | Есть замечания |
| 2. Безопасность | 3/10 | Критические проблемы |
| 3. Качество кода и чистота | 5/10 | Существенные замечания |
| 4. Обработка ошибок | 4/10 | Существенные замечания |
| 5. База данных и Prisma | 5/10 | Существенные замечания |
| 6. Тестирование | 6/10 | Есть замечания |
| 7. Конфигурация и DevOps | 4/10 | Существенные замечания |
| 8. API дизайн и документация | 7/10 | Мелкие замечания |

---

## 1. Архитектура и структура проекта (6/10)

Модульная структура NestJS реализована правильно: `PrismaModule` как глобальный модуль, `AuthModule` с отдельным сервисом и контроллером. Lazy-загрузка модулей, отдельные DTO, интерфейсы — всё на месте.

> **Правило `arch-feature-modules`** (NestJS Best Practices, CRITICAL): Организация по фичам, а не по техническим слоям. Проект следует этому правилу — `modules/auth/` содержит controller, service, dto, tests.

### `[MAJOR]` Дублирование интерфейсов `AuthResponse` и `LogoutResponse`

**Файл:** `src/modules/auth/auth.service.ts:27-33` и `src/modules/auth/auth.controller.ts:16-22`

Интерфейсы `AuthResponse` и `LogoutResponse` определены дважды — в сервисе и в контроллере. Это нарушение DRY и потенциальный источник рассинхронизации.

> **Правило `api-use-dto-serialization`** (NestJS Best Practices, MEDIUM): DTO и response-типы должны быть определены в отдельных файлах и переиспользоваться через imports. [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)

```ts
// auth.service.ts:27-33
interface AuthResponse {
  accessToken: string;
}
interface LogoutResponse {
  logout: boolean;
}

// auth.controller.ts:16-22 — идентичное определение
interface AuthResponse {
  accessToken: string;
}
interface LogoutResponse {
  logout: boolean;
}
```

**Исправление:** Вынести в общий файл `src/modules/interface/auth-response.ts` и импортировать в обоих местах. Рассмотреть использование `class` вместо `interface` для поддержки `@ApiProperty()` декораторов Swagger.

### `[MAJOR]` Метод `signIn` назван как "вход", но выполняет "регистрацию"

**Файл:** `src/modules/auth/auth.service.ts:58`

> **Правило `arch-single-responsibility`** (NestJS Best Practices, CRITICAL): Чёткая ответственность каждого метода. Имя метода должно отражать его назначение.

Метод `signIn` в `AuthService` выполняет **регистрацию** нового пользователя, а не вход. В индустрии "sign in" означает аутентификацию существующего пользователя. Контроллер усугубляет путаницу — метод назван `create` (строка 34 контроллера), что является дефолтом генератора NestJS.

```ts
// auth.service.ts:58 — регистрация, но названа signIn
async signIn(res: Response, dto: CreateAuthDto): Promise<AuthResponse> {

// auth.controller.ts:34 — вызывает signIn для endpoint POST /auth/register
create(@Body() createAuthDto: CreateAuthDto, ...): Promise<AuthResponse> {
  return this.authService.signIn(res, createAuthDto);
}
```

**Исправление:** Переименовать `signIn` → `register` в сервисе, `create` → `register` в контроллере. Согласно NestJS docs, имена controller-методов должны отражать бизнес-операцию.

### `[SUGGESTION]` Отсутствует глобальный AuthGuard

> **Правило `security-use-guards`** (NestJS Best Practices, HIGH): Используйте Guards для аутентификации и авторизации. [NestJS Authentication](https://docs.nestjs.com/security/authentication)

Согласно официальной документации NestJS, рекомендуется создать глобальный `AuthGuard`, который проверяет JWT на всех эндпоинтах, и помечать публичные маршруты декоратором `@Public()`:

```ts
// Из NestJS docs: https://docs.nestjs.com/security/authentication
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
```

---

## 2. Безопасность (3/10)

Это самая слабая область проекта. Есть несколько критических уязвимостей, которые обязательны к исправлению.

> **Правило `security-auth-jwt`** (NestJS Best Practices, HIGH): Реализуйте безопасную JWT-аутентификацию с ротацией токенов, безопасным хранением секретов и отзывом refresh tokens. [NestJS Security](https://docs.nestjs.com/security/authentication)

### `[CRITICAL]` Refresh token не хранится в БД — logout можно обойти

**Файл:** `src/modules/auth/auth.service.ts:163-207`

Refresh token подписывается JWT, но нигде не сохраняется. Метод `logout` (строка 203) лишь очищает cookie на клиенте, но сам токен остаётся криптографически валидным до истечения (7 дней). Если атакующий извлечёт refresh token до logout, он сможет генерировать новые access tokens неограниченно.

В модели `User` (prisma/schema.prisma) нет поля `refreshToken` или `refreshTokenHash`.

```ts
// auth.service.ts:203-207 — logout только чистит cookie
logout(res: Response): LogoutResponse {
  this.sendCookie(res, 'refreshToken', new Date(0));
  return { logout: true };
}
```

**Исправление (по NestJS Best Practices `security-auth-jwt`):**
1. Добавить поле `refreshToken String?` в модель `User` в `schema.prisma`
2. При вызове `auth()` — хешировать и сохранять refresh token в БД
3. При `refresh()` — проверять совпадение хеша с БД
4. При `logout()` — обнулять поле в БД

### `[CRITICAL]` `BCRYPT_SALT` читается как строка, но объявлен как число

**Файл:** `src/modules/auth/auth.service.ts:37,46,66`

> **Правило `devops-use-config-module`** (NestJS Best Practices, LOW-MEDIUM): Используйте ConfigModule с валидацией переменных окружения через `Joi` или `class-validator`. [NestJS Configuration](https://docs.nestjs.com/techniques/configuration#schema-validation)

`ConfigService.getOrThrow<number>` не выполняет runtime-преобразование — дженерик `<number>` это лишь подсказка TypeScript. Реальное значение из `.env` всегда строка `"10"`. На строке 66 применяется `+this.SALT` для явной коерсии, но если кто-то поставит `BCRYPT_SALT=abc`, salt получит `NaN`.

```ts
// Строка 37 — объявление
private readonly SALT: number;
// Строка 46 — получение (реально строка!)
this.SALT = configService.getOrThrow<number>('BCRYPT_SALT');
// Строка 66 — коерсия
const salts = await genSalt(+this.SALT);
```

**Исправление:**
```ts
const raw = configService.getOrThrow<string>('BCRYPT_SALT');
this.SALT = parseInt(raw, 10);
if (isNaN(this.SALT) || this.SALT < 10 || this.SALT > 31) {
  throw new Error(`BCRYPT_SALT must be a number between 10 and 31, got: "${raw}"`);
}
```

Или лучше — реализовать валидацию env через `ConfigModule.forRoot({ validationSchema })` с Joi, как рекомендует NestJS docs.

### `[CRITICAL]` `.env.example` содержит реальные credentials и слабый JWT secret

**Файл:** `.env.example:15,24`

```
DEVELOPMENT_POSTGRES=postgresql://postgres:123456@localhost:5433/postgresql
JWT_SECRET_KEY=sss12345678910
```

`.env.example` коммитится в Git. Значение `sss12345678910` — крайне слабый секрет (14 символов, alphanumeric). Пароль PostgreSQL `123456` тоже открыт. Новые разработчики копируют `.env.example` → `.env` без изменений.

> Из NestJS docs (`security/authentication`): JWT secret должен быть сгенерирован криптографически надёжным генератором и иметь длину минимум 256 бит (32 байта).

**Исправление:** Заменить на плейсхолдеры:
```
DEVELOPMENT_POSTGRES=postgresql://<user>:<password>@localhost:5433/<db_name>
JWT_SECRET_KEY=<your-strong-random-secret-min-32-chars>
```

### `[MAJOR]` `EMAIL_PATTERN` — неэкранированная точка пропускает невалидные email

**Файл:** `shared/regexp-pattern.ts:4`

> **Правило `security-validate-all-input`** (NestJS Best Practices, HIGH): Валидируйте все входные данные с помощью class-validator и pipes. [NestJS Validation](https://docs.nestjs.com/techniques/validation)

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;
//                                       ^ — не экранирована!
```

Точка `.` без экранирования матчит **любой** символ. Email `user@exampleXcom` пройдёт валидацию.

**Исправление:**
```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

### `[MAJOR]` `USER_PATTERN` допускает опасные спецсимволы в username

**Файл:** `shared/regexp-pattern.ts:6`

> **Правило `security-sanitize-output`** (NestJS Best Practices, HIGH): Предотвращайте XSS атаки. Валидируйте входные данные и санитайзите вывод.

```ts
const USER_PATTERN = /^\S{3,20}$/;
```

`\S` матчит **любой** непробельный символ, включая `<`, `>`, `"`, `'`, `/`, `\`. Username с такими символами может вызвать XSS при отображении в UI или проблемы в URL.

**Исправление:**
```ts
const USER_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;
```

### `[MAJOR]` Login возвращает `ForbiddenException` (403) вместо `UnauthorizedException` (401)

**Файл:** `src/modules/auth/auth.service.ts:95,103`

> **Правило `error-throw-http-exceptions`** (NestJS Best Practices, HIGH): Используйте правильные NestJS HTTP exceptions. 401 = не аутентифицирован, 403 = аутентифицирован, но нет прав.

HTTP 403 Forbidden означает "у вас нет прав", а не "неверные учётные данные". Для неуспешной аутентификации стандарт — 401 Unauthorized. Из NestJS docs: `UnauthorizedException` для невалидных credentials, `ForbiddenException` для авторизации.

```ts
// Строка 95 — пользователь не найден
throw new ForbiddenException('Пользователь не существует или неверный пароль');
// Строка 103 — неверный пароль
throw new ForbiddenException('Пользователь не существует или неверный пароль');
```

**Исправление:** Заменить `ForbiddenException` → `UnauthorizedException`.

### `[SUGGESTION]` Отсутствует Rate Limiting

> **Правило `security-rate-limiting`** (NestJS Best Practices, HIGH): Реализуйте ограничение частоты запросов для защиты от brute-force атак. [NestJS Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

Auth endpoints (`/auth/login`, `/auth/register`) не защищены от brute-force атак. Рекомендуется `@nestjs/throttler`:

```ts
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),

// auth.controller.ts
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
```

---

## 3. Качество кода и чистота (5/10)

### `[MAJOR]` `findOne` использует `OR [email, username]` — потенциальные ложные совпадения

**Файл:** `src/modules/auth/auth.service.ts:126-147`

Метод `findOne` всегда ищет по OR: email ИЛИ username. При логине, если пользователь отправляет только email (без username), `dto.username` будет `undefined` или `""`. Prisma включит `username: { equals: '', mode: 'insensitive' }` в OR — теоретически может найти пользователя с пустым username.

При регистрации: если Alice хочет зарегистрироваться с `email=a@a.com, username=bob`, а Bob уже существует с `username=bob` но другим email, Alice будет заблокирована с "пользователь уже существует", хотя её email уникален.

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

**Исправление:** Для логина — делать условный запрос в зависимости от того, что передано. Для регистрации — проверять email и username отдельно, чтобы давать конкретное сообщение ("email уже занят" или "username уже занят").

### `[MINOR]` `logout` передаёт имя cookie как значение token

**Файл:** `src/modules/auth/auth.service.ts:204`

```ts
this.sendCookie(res, 'refreshToken', new Date(0));
```

Второй параметр `sendCookie` — это значение cookie (строка 194: `token: string`). Передаётся строка `'refreshToken'`, что является именем cookie, а не его значением. Cookie всё равно удалится (expired date), но это запутывает.

**Исправление:** `this.sendCookie(res, '', new Date(0));`

### `[MINOR]` `main.ts:46` — неверный тип-дженерик `<number>` для `DEV_HOST`

**Файл:** `src/main.ts:46`

```ts
const host = config.getOrThrow<number>('DEV_HOST');
```

`DEV_HOST` — это URL-строка (`http://localhost:4200`), а не число.

**Исправление:** `config.getOrThrow<string>('DEV_HOST')`

### `[MINOR]` `prisma.service.ts` — ошибки логируются на уровне INFO

**Файл:** `prisma/prisma.service.ts:36,45`

> **Правило `devops-use-logging`** (NestJS Best Practices, LOW-MEDIUM): Используйте структурированное логирование с правильными уровнями (error, warn, log, debug).

```ts
this.logger.log(`Fail to connect ${error}`);   // строка 36
this.logger.log(`Fail to disconnect ${error}`); // строка 45
```

Ошибки подключения к БД логируются через `logger.log` (INFO), а не `logger.error` (ERROR).

**Исправление:** `this.logger.error('Fail to connect', error);`

---

## 4. Обработка ошибок (4/10)

> **Правило `error-handle-async-errors`** (NestJS Best Practices, HIGH): Все async-операции должны иметь обработку ошибок. Необработанные Promise rejections ведут к 500 ошибкам и утечкам информации.

### `[CRITICAL]` `refresh()` не ловит ошибку `jwtService.verifyAsync`

**Файл:** `src/modules/auth/auth.service.ts:170`

`verifyAsync` бросает `JsonWebTokenError` или `TokenExpiredError` из библиотеки `jsonwebtoken`. Это **не** NestJS HTTP-исключения. Без `try/catch` ошибка пробрасывается как 500 Internal Server Error вместо 401.

> Из NestJS docs (`security/authentication`): `verifyAsync` должен быть обёрнут в `try/catch` с выбросом `UnauthorizedException`. Это показано в [официальном примере AuthGuard](https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard).

```ts
// Строка 170 — нет try/catch!
const payload: JwtPayload = await this.jwtService.verifyAsync(refresh);
```

**Исправление (из NestJS official docs):**
```ts
let payload: JwtPayload;
try {
  payload = await this.jwtService.verifyAsync<JwtPayload>(refresh);
} catch {
  throw new UnauthorizedException('Токен больше не действителен');
}
```

### `[CRITICAL]` `signIn` (регистрация) — race condition TOCTOU + необработанный P2002

**Файл:** `src/modules/auth/auth.service.ts:58-88`

> **Правило `db-use-transactions`** (NestJS Best Practices, MEDIUM-HIGH): Используйте транзакции для multi-step операций. [Prisma Error Handling](https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors)

Регистрация проверяет уникальность через `findOne`, затем создаёт пользователя. Между этими операциями конкурентный запрос может создать того же пользователя. `prisma.user.create` бросит `P2002` (unique constraint violation), который не перехвачен — клиент получит 500.

```ts
// Строка 59 — проверка
const existingUser = await this.findOne(dto);
// ...
// Строка 68 — создание (между проверкой и созданием — race condition)
const user = await this.prisma.user.create({ ... });
```

**Исправление (по Prisma docs — error handling):**
```ts
import { Prisma } from 'src/generated/prisma/client';

try {
  const user = await this.prisma.user.create({ data: { ... } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('Пользователь уже существует');
    }
  }
  throw error;
}
```

Или глобально — через `PrismaClientExceptionFilter` ([Prisma + NestJS Error Handling](https://www.prisma.io/blog/nestjs-prisma-error-handling)):

```ts
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    switch (exception.code) {
      case 'P2002':
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Запись уже существует',
        });
        break;
      default:
        super.catch(exception, host);
    }
  }
}
```

### `[SUGGESTION]` Отсутствует глобальный Exception Filter

> **Правило `error-use-exception-filters`** (NestJS Best Practices, HIGH): Используйте centralized exception handling через Exception Filters для единообразных ответов об ошибках. [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)

---

## 5. База данных и Prisma (5/10)

### `[MAJOR]` Отсутствует `url` в `datasource db` — Prisma CLI не сможет работать

**Файл:** `prisma/schema.prisma:6-8`

> Из [Prisma Docs — Datasource](https://www.prisma.io/docs/orm/reference/prisma-schema-reference#datasource): поле `url` обязательно для работы CLI команд.

```prisma
datasource db {
  provider = "postgresql"
}
```

Поле `url` отсутствует. Prisma CLI (`prisma migrate dev`, `prisma generate`) требует `url` в datasource. Runtime-подключение через `@prisma/adapter-pg` обходит это, но CLI-команды не будут работать.

**Исправление:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

И добавить `DATABASE_URL` в `.env.example`.

### `[SUGGESTION]` Модель `User` не имеет поля для хранения refresh token

**Файл:** `prisma/schema.prisma:15-25`

> Из [Prisma Docs — Schema](https://www.prisma.io/docs/orm/prisma-schema): при изменении модели обязательно запустить `prisma migrate dev` для создания миграции.

Для реализации отзыва refresh tokens (см. пункт безопасности #1) нужно добавить поле:
```prisma
model User {
  // ...existing fields
  refreshToken String?
}
```

---

## 6. Тестирование (6/10)

> **Правило `test-use-testing-module`** (NestJS Best Practices, MEDIUM-HIGH): Используйте `Test.createTestingModule()` для юнит-тестов. Мокайте внешние зависимости для изоляции. [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### `[MINOR]` Тест `refresh` мокает `verifyAsync` с `UnauthorizedException`, а не с `JsonWebTokenError`

**Файл:** `src/modules/auth/__tests__/auth.service.spec.ts`

> **Правило `test-mock-external-services`** (NestJS Best Practices, MEDIUM-HIGH): Моки должны точно отражать поведение реальных зависимостей.

Тест для `refresh` с невалидным токеном мокает `jwtService.verifyAsync` так, чтобы он бросал `UnauthorizedException`. В реальности библиотека `jsonwebtoken` бросает свои собственные типы ошибок (`JsonWebTokenError`, `TokenExpiredError`), что маскирует баг с необработанной ошибкой (см. пункт 4.1).

### `[SUGGESTION]` Добавить тесты для edge cases

- Регистрация с дублирующимся email (P2002 handling)
- Login с пустым username при режиме email
- Refresh с истёкшим токеном (реальный `TokenExpiredError`)
- Валидация regex-паттернов с граничными значениями

### `[SUGGESTION]` Добавить E2E тесты для auth flow

> **Правило `test-e2e-supertest`** (NestJS Best Practices, MEDIUM-HIGH): Используйте Supertest для E2E-тестирования полного HTTP цикла. [NestJS E2E Testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)

---

## 7. Конфигурация и DevOps (4/10)

### `[MAJOR]` `.env.example` — дублирующиеся ключи и JS-комментарии

**Файл:** `.env.example:1-26`

> **Правило `devops-use-config-module`** (NestJS Best Practices, LOW-MEDIUM): Используйте `ConfigModule` с валидацией схемы. [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)

- `PORT` определён дважды (строки 4 и 10) — `dotenv` берёт последний
- `HOST` определён дважды (строки 5 и 11)
- Строки 14 и 20 используют `//` комментарии — `dotenv` поддерживает только `#`
- Отсутствует `DATABASE_URL`, который указан в CLAUDE.md как обязательный

**Исправление:** Дедуплицировать ключи, использовать `#` для комментариев, добавить `DATABASE_URL`. Реализовать валидацию env через `ConfigModule.forRoot({ validationSchema })`.

### `[MAJOR]` `bcrypt` и `bcrypt-ts` — дублирующиеся зависимости

**Файл:** `package.json:42-43`

```json
"bcrypt": "^6.0.0",
"bcrypt-ts": "^8.0.1",
```

Код импортирует только `bcrypt-ts`. Пакет `bcrypt` — нативный аддон, требующий C++ toolchain, замедляющий `npm ci` и потенциально ломающий сборку в Docker.

**Исправление:** Удалить `bcrypt` из `dependencies`.

### `[MAJOR]` `@nestjs/mapped-types: "*"` — неограниченная версия

**Файл:** `package.json:37`

```json
"@nestjs/mapped-types": "*",
```

Wildcard `*` может подтянуть мажорную несовместимую версию при регенерации lock-файла.

**Исправление:** `"@nestjs/mapped-types": "^2.0.6"`

### `[MINOR]` `tsconfig.json` — `noImplicitAny: false` снижает типобезопасность

Отключённый `noImplicitAny` позволяет неявные `any`-типы, что вместе с `@typescript-eslint/no-explicit-any: 'off'` в ESLint создаёт двойную дыру в типобезопасности.

### `[MINOR]` ESLint — `no-floating-promises` и `no-unsafe-argument` как `warn`

**Файл:** `eslint.config.mjs`

> **Правило `error-handle-async-errors`** (NestJS Best Practices, HIGH): Floating promises — частая причина багов в async NestJS хэндлерах.

Эти правила установлены в `warn`, а CI (`ci:lint`) запускается без `--max-warnings=0`. Warnings не ломают билд, поэтому floating promises будут копиться незамеченными.

**Исправление:** Поднять до `'error'` или добавить `--max-warnings=0` в `ci:lint`.

### `[SUGGESTION]` Реализовать Graceful Shutdown

> **Правило `devops-graceful-shutdown`** (NestJS Best Practices, LOW-MEDIUM): Включите `app.enableShutdownHooks()` для корректного завершения при SIGTERM. [NestJS Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events)

---

## 8. API дизайн и документация (7/10)

Swagger интегрирован, есть декораторы `@ApiOperation`, `@ApiResponse`, `@ApiBody`. Документация доступна по `/docs` и `/openapi.yaml`. CORS настроен с поддержкой Netlify deploy previews через regex.

> **Правило `api-use-interceptors`** (NestJS Best Practices, MEDIUM): Используйте Interceptors для cross-cutting concerns: логирование, трансформация ответов, кэширование.

### `[MINOR]` Swagger добавляет `Bearer Auth`, но ни один endpoint его не требует

**Файл:** `src/main.ts:32`

```ts
.addBearerAuth()
```

`addBearerAuth()` добавляет секьюрити-схему в Swagger, но ни один контроллер не использует `@ApiBearerAuth()` декоратор. Кнопка "Authorize" в Swagger UI ничего не делает.

### `[SUGGESTION]` Добавить версионирование API (`/api/v1/auth/...`)

> **Правило `api-versioning`** (NestJS Best Practices, MEDIUM): Используйте API versioning для breaking changes. [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)

---

## 9. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Исправить хранение refresh token в БД + отзыв при logout (`security-auth-jwt`)
- [ ] Добавить `try/catch` в `refresh()` для `verifyAsync` (`error-handle-async-errors`)
- [ ] Обработать `P2002` в `signIn` — через try/catch или PrismaClientExceptionFilter (`error-use-exception-filters`)
- [ ] Исправить `EMAIL_PATTERN` — экранировать точку (`security-validate-all-input`)
- [ ] Заменить credentials в `.env.example` на плейсхолдеры (`security-auth-jwt`)
- [ ] Добавить `url = env("DATABASE_URL")` в `schema.prisma` (Prisma docs)
- [ ] Создать глобальный `AuthGuard` с `@Public()` декоратором (`security-use-guards`)

### Приоритет 2 (важно)
- [ ] Переименовать `signIn` → `register` (`arch-single-responsibility`)
- [ ] Вынести общие интерфейсы в отдельный файл (`api-use-dto-serialization`)
- [ ] Удалить дублирующий пакет `bcrypt`
- [ ] Зафиксировать версию `@nestjs/mapped-types`
- [ ] Заменить `ForbiddenException` → `UnauthorizedException` в `login` (`error-throw-http-exceptions`)
- [ ] Исправить логику `findOne` для раздельной проверки email/username
- [ ] Дедуплицировать `.env.example` + добавить валидацию env (`devops-use-config-module`)
- [ ] Добавить Rate Limiting на auth endpoints (`security-rate-limiting`)

### Приоритет 3 (желательно)
- [ ] Включить `noImplicitAny: true` в tsconfig
- [ ] Поднять ESLint warnings до errors (`error-handle-async-errors`)
- [ ] Исправить `logger.log` → `logger.error` в PrismaService (`devops-use-logging`)
- [ ] Ограничить `USER_PATTERN` до `[a-zA-Z0-9_-]` (`security-sanitize-output`)
- [ ] Добавить тесты edge cases для auth (`test-use-testing-module`)
- [ ] Реализовать Graceful Shutdown (`devops-graceful-shutdown`)
- [ ] Добавить E2E тесты (`test-e2e-supertest`)

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
| Prisma Error Handling | https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors |
| Prisma + NestJS Exception Filter | https://www.prisma.io/blog/nestjs-prisma-error-handling |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 5.5/10 | 4 | 8 | 6 |
