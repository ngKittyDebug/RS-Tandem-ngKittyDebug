# Backend (NestJS)

Backend для приложения RS-Tandem-ngKittyDebug на NestJS с использованием Prisma ORM и PostgreSQL.

## Зависимости

### Предварительные требования

- Node.js >= 20
- npm >= 10
- Docker и Docker Compose

## Запуск приложения

### Настройка окружения

Скопируйте файл `.env.example` и настройте переменные окружения:

```bash
cp .env.example .env
```

Необходимые переменные окружения:

- `DATABASE_URL` — строка подключения к PostgreSQL
- `PORT` — порт сервера (по умолчанию 3000)
- `HOST` — хост сервера (по умолчанию http://localhost)
- `POSTGRES_USER` — пользователь PostgreSQL
- `POSTGRES_PASSWORD` — пароль PostgreSQL
- `POSTGRES_DB` — имя базы данных PostgreSQL

### Запуск в режиме разработки

1. Установите зависимости:

```bash
npm ci
```

2. Поднимите Docker контейнер с PostgreSQL:

```bash
# Запуск контейнера postgres (образ: postgres:17.5-alpine3.22)
npm run docker:dev
```

Контейнер будет доступен на порту `5433`.

3. Сгенерируйте Prisma клиента:

```bash
npm run generate:dev
```

4. Примените миграции (при необходимости):

```bash
npm run migration:dev
```

5. Запустите сервер в режиме разработки:

```bash
# Запуск с авто-перезагрузкой (режим development)
npm run start:dev

# Запуск с отладкой
npm run start:debug
```

### Запуск в production режиме

1. Установите зависимости:

```bash
npm ci
```

2. Поднимите Docker контейнер с PostgreSQL:

```bash
npm run docker:dev
```

3. Сгенерируйте Prisma клиента:

```bash
npm run generate:dev
```

4. Примените миграции:

```bash
npm run migration:dev
```

5. Соберите проект:

```bash
npm run build
```

6. Запустите production сервер:

```bash
npm run start:prod
```

## Swagger (API документация)

Проект использует Swagger для документирования API.

### Запуск Swagger

После запуска приложения Swagger доступен по адресу:

```
http://localhost:3000/docs
```

### Возможности

- **Интерактивная документация** — просмотр всех доступных эндпоинтов
- **Тестирование API** — возможность отправлять запросы прямо из браузера
- **Bearer Auth** — поддержка авторизации через JWT токены
- **Экспорт в YAML** — документация доступна по адресу `/openapi.yaml`

### Примеры запросов через Swagger

1. Откройте `http://localhost:3000/docs`
2. Раздел **auth** содержит следующие эндпоинты:
   - `POST /auth` — создание нового пользователя
   - `PATCH /auth/:id` — обновление пользователя
   - `DELETE /auth/:id` — удаление пользователя

3. Для авторизации нажмите кнопку **Authorize** и введите JWT токен

---

## Доступные эндпоинты

### Auth Controller

| Метод  | Эндпоинт    | Описание                      |
| ------ | ----------- | ----------------------------- |
| POST   | `/auth`     | Создание нового пользователя  |
| PATCH  | `/auth/:id` | Обновление пользователя по ID |
| DELETE | `/auth/:id` | Удаление пользователя по ID   |

### Пример запроса для создания пользователя

```bash
POST http://localhost:3000/auth
Content-Type: application/json

{
  "email": "test@gmail.com",
  "password": "Alex"
}
```

---

## Команды для разработки

### Линтинг и форматирование

```bash
# Форматирование кода
npm run format

# Проверка форматирования (для CI)
npm run ci:format

# Линтинг
npm run lint

# Проверка линтинга (для CI)
npm run ci:lint

# Проверка типов
npm run typecheck
```

### Тесты

```bash
# Запуск тестов
npm run test

# Запуск тестов в режиме watch
npm run test:watch

# Покрытие тестами
npm run test:cov

# E2E тесты
npm run test:e2e
```

### Проверка всех (ci:format, typecheck, ci:lint, test)

```bash
npm run check-all
```

### Prisma команды

```bash
# Применение миграций (dev режим)
npm run migration:dev

# Применение миграций
npm run migration

# Push схемы БД (dev режим)
npm run db:push:dev

# Push схемы БД
npm run db:push

# Генерация Prisma клиента (dev режим)
npm run generate:dev
```

---
