# Backend (NestJS)

Backend для приложения MeowVault на NestJS с использованием Prisma ORM и PostgreSQL.

## 📋 Требования

Перед началом убедитесь, что у вас установлены:

- **Node.js** >= 20
- **npm** >= 10
- **Docker** и **Docker Compose**

---

## 🚀 Пошаговая инструкция по запуску

### Шаг 1: Установка зависимостей

```bash
npm ci
```

> `npm ci` устанавливает зависимости из `package-lock.json` (быстрее и надёжнее, чем `npm install`).

### Шаг 2: Настройка окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Откройте `.env` и настройте переменные:

```env
DOMAIN=localhost
MODE=product

PORT=4000
HOST=http://localhost
DEPLOY_URL_CORS=/^https:\/\/(deploy-preview-\d+--)?meowvault\.netlify\.app$/

DEV_HOST=http://localhost:4200

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<ваш-надежный-пароль>
POSTGRES_DB=postgres

# Bcrypt
BCRYPT_SALT=10

# JWT
JWT_SECRET_KEY=<ваш-секретный-ключ-минимум-32-символа>
JWT_ACCESS_TOKEN_EXPIRE_TIME=1h
JWT_REFRESH_TOKEN_EXPIRE_TIME=7d

# GitHub OAuth2
REDIRECT_FRONTEND=http://localhost:4200/
CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_CLIENT_ID=<ваш-client-id>
GITHUB_CLIENT_SECRET=<ваш-client-secret>
```

> ⚠️ **Важно:** Замените все placeholder-значения (`<...>`) на реальные значения!
>
> - `POSTGRES_PASSWORD` — придумайте надёжный пароль для базы данных
> - `JWT_SECRET_KEY` — сгенерируйте случайную строку минимум 32 символа (например, через `openssl rand -base64 32`)
> - `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET` — создайте в [GitHub OAuth Apps](https://github.com/settings/developers)

**Полный список переменных окружения:**

| Переменная                      | Описание                             | По умолчанию                |
| ------------------------------- | ------------------------------------ | --------------------------- |
| `DOMAIN`                        | Домен приложения                     | `localhost`                 |
| `MODE`                          | Режим работы (`product` / `develop`) | `product`                   |
| `PORT`                          | Порт сервера                         | `4000`                      |
| `HOST`                          | Основной хост                        | `http://localhost`          |
| `DEPLOY_URL_CORS`               | Regex для CORS (deploy previews)     | —                           |
| `DEV_HOST`                      | Хост фронтенда для разработки        | `http://localhost:4200`     |
| `POSTGRES_USER`                 | Пользователь PostgreSQL              | `postgres`                  |
| `POSTGRES_PASSWORD`             | Пароль PostgreSQL                    | —                           |
| `POSTGRES_DB`                   | Имя базы данных                      | `postgres`                  |
| `BCRYPT_SALT`                   | Соль для хеширования паролей         | `10`                        |
| `JWT_SECRET_KEY`                | Секретный ключ для JWT               | —                           |
| `JWT_ACCESS_TOKEN_EXPIRE_TIME`  | Время жизни access token             | `1h`                        |
| `JWT_REFRESH_TOKEN_EXPIRE_TIME` | Время жизни refresh token            | `7d`                        |
| `GITHUB_CLIENT_ID`              | Client ID для GitHub OAuth           | —                           |
| `GITHUB_CLIENT_SECRET`          | Client Secret для GitHub OAuth       | —                           |
| `REDIRECT_FRONTEND`             | URL редиректа после OAuth            | `http://localhost:4200/`    |
| `CALLBACK_URL`                  | Callback URL для GitHub OAuth        | `http://localhost:3000/...` |

### Шаг 3: Запуск PostgreSQL (Docker)

```bash
npm run docker:dev
```

Эта команда запустит контейнер с PostgreSQL на порту **5433**.

> Для остановки контейнера: `docker-compose down`
> Для удаления данных: `docker-compose down -v`

### Шаг 4: Генерация Prisma клиента

```bash
npm run generate:dev
```

Prisma сгенерирует клиент на основе `schema.prisma` для работы с базой данных.

### Шаг 5: Применение миграций

```bash
npm run migration:dev
```

Будут применены все миграции и создана структура базы данных.

> При создании новой миграции: `npm run migration:dev` создаст и применит её.
> Для production: `npm run migration` (только применение без создания).

### Шаг 6: Запуск сервера

```bash
# Режим разработки (с авто-перезагрузкой при изменении файлов)
npm run start:dev

# Режим отладки (с debugger, можно подключиться через DevTools)
npm run start:debug

# Production режим (предварительно выполните npm run build)
npm run start:prod
```

После запуска сервер будет доступен по адресу: **http://localhost:4000**

---

## 📚 Swagger (API документация)

После запуска приложения Swagger UI доступен по адресу:

```
http://localhost:4000/docs
```

Экспорт спецификации в YAML:

```
http://localhost:4000/openapi.yaml
```

📖 **Подробная документация по Swagger:** [SWAGGER_WIKI.md](./SWAGGER_WIKI.md)

---

## 🛠️ Дополнительные команды

### Prisma Studio (визуальный редактор БД)

```bash
npm run prisma-studio
```

Откроется веб-интерфейс для просмотра и редактирования данных в базе данных.

### Проверка кода

```bash
# Полная проверка (форматирование + типы + линтинг + тесты)
npm run check-all

# Отдельные проверки
npm run ci:format    # Проверка форматирования (Prettier)
npm run typecheck    # Проверка типов TypeScript
npm run ci:lint      # Проверка линтинга (ESLint)
npm run test         # Запуск unit-тестов
npm run test:cov     # Тесты с отчётом о покрытии
npm run test:e2e     # E2E тесты
```

### Форматирование и линтинг

```bash
npm run format  # Авто-форматирование кода (Prettier)
npm run lint    # Авто-исправление проблем линтера (ESLint)
```

---

## 📁 Структура проекта

```
backend/
├── prisma/
│   ├── schema.prisma          # Схема базы данных (модели, связи)
│   └── migrations/            # Миграции Prisma (версионирование БД)
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts    # Эндпоинты: /auth/register, /auth/login, /auth/refresh, /auth/logout
│   │   │   ├── auth.service.ts       # Логика аутентификации
│   │   │   ├── auth.module.ts
│   │   │   └── dto/
│   │   │       ├── create-auth.dto.ts    # DTO регистрации
│   │   │       └── login-auth.dto.ts     # DTO входа
│   │   │
│   │   ├── user/
│   │   │   ├── user.controller.ts    # Эндпоинты: /user, /user/profile, /user/password, /user (DELETE)
│   │   │   ├── user.service.ts       # Логика управления пользователем
│   │   │   ├── user.module.ts
│   │   │   └── dto/
│   │   │       ├── update-user.dto.ts    # DTO обновления профиля
│   │   │       └── update-user-pass.ts   # DTO смены пароля
│   │   │
│   │   └── interface/
│   │       └── jwt-payload.ts        # Интерфейс JWT payload
│   │
│   ├── guards/
│   │   └── auth.guard.ts             # JWT Guard для защиты маршрутов
│   │
│   ├── decorators/
│   │   └── public.decorator.ts       # Декоратор @Public() для открытых маршрутов
│   │
│   ├── utils/
│   │
│   ├── app.module.ts                 # Корневой модуль приложения
│   └── main.ts                       # Точка входа приложения
│
├── shared/
│   └── regexp-pattern.ts             # Паттерны валидации (email, password, username)
│
├── test/                             # E2E тесты
│
├── .env.example                      # Шаблон переменных окружения
├── docker-compose.yml                # Конфигурация Docker
├── nest-cli.json                     # Настройки NestJS CLI
├── package.json                      # Зависимости и скрипты
├── tsconfig.json                     # Настройки TypeScript
└── README.md                         # Этот файл
```

---

## 📜 Все доступные скрипты

### Основные

| Команда               | Описание                                       |
| --------------------- | ---------------------------------------------- |
| `npm run start:dev`   | Запуск в режиме разработки (авто-перезагрузка) |
| `npm run start:debug` | Запуск с отладчиком                            |
| `npm run start:prod`  | Запуск production версии                       |
| `npm run build`       | Сборка проекта                                 |

### База данных (Prisma)

| Команда                 | Описание                                      |
| ----------------------- | --------------------------------------------- |
| `npm run docker:dev`    | Запуск PostgreSQL в Docker (порт 5433)        |
| `npm run generate:dev`  | Генерация Prisma клиента                      |
| `npm run migration:dev` | Создание и применение миграций (dev)          |
| `npm run migration`     | Применение миграций (production)              |
| `npm run prisma-studio` | Запуск Prisma Studio (визуальный редактор БД) |

### Проверка кода

| Команда             | Описание                                           |
| ------------------- | -------------------------------------------------- |
| `npm run format`    | Форматирование кода (Prettier)                     |
| `npm run ci:format` | Проверка форматирования (для CI)                   |
| `npm run lint`      | Линтинг кода (ESLint)                              |
| `npm run ci:lint`   | Проверка линтинга (для CI)                         |
| `npm run typecheck` | Проверка типов TypeScript                          |
| `npm run check-all` | Полная проверка (format + typecheck + lint + test) |

### Тесты

| Команда              | Описание                 |
| -------------------- | ------------------------ |
| `npm run test`       | Запуск unit-тестов       |
| `npm run test:watch` | Тесты в режиме watch     |
| `npm run test:cov`   | Тесты с отчётом покрытия |
| `npm run test:debug` | Тесты с отладчиком       |
| `npm run test:e2e`   | E2E (end-to-end) тесты   |

---

## 🔧 Troubleshooting

### Порт 5433 уже занят

Если порт 5433 уже используется другим процессом, измените порт в `docker-compose.yml`:

```yaml
ports:
  - 5434:5432 # Замените 5433 на свободный порт
```

И обновите `DATABASE_URL` в `.env` соответственно.

### Ошибка Prisma: `Can't reach database server`

1. Убедитесь, что Docker контейнер запущен: `docker ps`
2. Проверьте `DATABASE_URL` в `.env` (должен соответствовать порту из docker-compose)
3. Перезапустите контейнер: `docker-compose down && docker-compose up -d`

### Ошибка JWT_SECRET_KEY

Убедитесь, что `JWT_SECRET_KEY` — это случайная строка минимум **32 символа**.
Сгенерировать можно командой:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 🔗 Полезные ссылки

- [Документация по Swagger](./SWAGGER_WIKI.md) — подробное руководство по Swagger UI
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [GitHub OAuth Setup](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
