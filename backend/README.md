# Backend (NestJS)

Backend для приложения RS-Tandem-ngKittyDebug на NestJS с использованием Prisma ORM и PostgreSQL.

## Требования

- Node.js >= 20
- npm >= 10
- Docker и Docker Compose

---

## Быстрый старт

### 1. Установка зависимостей

```bash
npm ci
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

**Необходимые переменные:**

| Переменная          | Описание                        | По умолчанию       |
| ------------------- | ------------------------------- | ------------------ |
| `DATABASE_URL`      | Строка подключения к PostgreSQL | —                  |
| `PORT`              | Порт сервера                    | `3000`             |
| `DEV_HOST`          | Хост сервера                    | `http://localhost` |
| `POSTGRES_USER`     | Пользователь PostgreSQL         | —                  |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL               | —                  |
| `POSTGRES_DB`       | Имя базы данных                 | —                  |
| `BCRYPT_SALT`       | Соль для хеширования паролей    | `10`               |

### 3. Запуск PostgreSQL (Docker)

```bash
npm run docker:dev
```

Контейнер будет доступен на порту `5433`.

### 4. Генерация Prisma клиента

```bash
npm run generate:dev
```

### 5. Применение миграций

```bash
npm run migration:dev
```

### 6. Запуск сервера

```bash
# Режим разработки (авто-перезагрузка)
npm run start:dev

# Режим отладки
npm run start:debug

# Production режим
npm run start:prod
```

---

## Swagger (API документация)

После запуска приложения Swagger доступен по адресу:

```
http://localhost:3000/docs
```

Экспорт спецификации в YAML:

```
http://localhost:3000/openapi.yaml
```

📖 **Подробная документация по Swagger:** [SWAGGER_WIKI.md](./SWAGGER_WIKI.md)

---

## Структура проекта

```
backend/
├── prisma/
│   ├── schema.prisma          # Схема базы данных
│   └── migrations/            # Миграции Prisma
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

## Доступные скрипты

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
| `npm run docker:dev`    | Запуск PostgreSQL в Docker                    |
| `npm run generate:dev`  | Генерация Prisma клиента                      |
| `npm run migration:dev` | Применение миграций (dev)                     |
| `npm run migration`     | Применение миграций (prod)                    |
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

| Команда              | Описание             |
| -------------------- | -------------------- |
| `npm run test`       | Запуск тестов        |
| `npm run test:watch` | Тесты в режиме watch |
| `npm run test:cov`   | Тесты с покрытием    |
| `npm run test:e2e`   | E2E тесты            |

---

## Полезные ссылки

- [Документация по Swagger](./SWAGGER_WIKI.md) — подробное руководство по использованию Swagger UI
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
