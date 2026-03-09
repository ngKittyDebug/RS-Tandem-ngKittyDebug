# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeowVault** — образовательный каталог с играми для прокачки знаний JavaScript/TypeScript и подготовки к техническому интервью.

Монорепозиторий с двумя независимыми приложениями: `backend/` и `frontend/`. Каждое имеет собственные зависимости, конфиги и CI-проверки.

## Backend (NestJS + Prisma + PostgreSQL)

### Запуск

```bash
cd backend
npm ci
npm run docker:dev          # поднять PostgreSQL в Docker (порт 5433)
npm run generate:dev        # сгенерировать Prisma клиент
npm run migration:dev       # применить миграции
npm run start:dev           # dev-сервер с авторезагрузкой
```

### Команды разработчика

```bash
npm run check-all           # ci:format + typecheck + ci:lint + test (то, что проверяет CI)
npm run test                # unit-тесты (Jest)
npm run test:watch          # тесты в watch-режиме
npm run test:e2e            # e2e-тесты
npm run lint                # eslint с автофиксом
npm run format              # prettier с записью
npm run typecheck           # tsc --noEmit
npm run prisma-studio       # Prisma Studio (UI для БД)
```

### Необходимые env-переменные (`.env` на основе `.env.example`)

`DATABASE_URL`, `PORT`, `DEV_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `BCRYPT_SALT`, `JWT_ACCESS_TOKEN_EXPIRE_TIME`, `JWT_REFRESH_TOKEN_EXPIRE_TIME`, `DEPLOY_URL_CORS`

### Prisma

- Схема: `backend/prisma/schema.prisma`
- Сгенерированный клиент: `backend/src/generated/prisma/` (не редактировать вручную)
- После изменения схемы — обязательно `npm run generate:dev`
- Путевые алиасы в jest: `prisma/` → `<rootDir>/../prisma/`, `src/` → `<rootDir>/`

## Frontend (Angular 21)

### Запуск

```bash
cd frontend
npm ci
npm start                   # ng serve → http://localhost:4200
```

### Команды разработчика

```bash
npm run check-all           # typecheck + lint + ci:format + test
npm test                    # Vitest (ng test --no-watch)
npm run lint                # angular-eslint
npm run format              # prettier --write
npm run typecheck           # tsc --noEmit
npm run build               # production-сборка в dist/
```

## Архитектура

### Backend

Модульная структура NestJS:

- **`PrismaModule`** — глобальный модуль, экспортирует `PrismaService` во все модули
- **`AuthModule`** — регистрация, вход, обновление токенов, выход

**JWT-стратегия:** access token возвращается в теле ответа, refresh token — в httpOnly cookie (`sameSite: lax` в dev, `none` в prod). Переключение dev/prod через `MODE=develop` (env-переменная).

**API:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`

**Swagger:** `http://localhost:3000/docs` | YAML: `/openapi.yaml`

### Frontend

Standalone Angular-компоненты (без NgModule). Все роуты lazy-loaded:

| Путь | Компонент |
|------|-----------|
| `/` | Main |
| `/login` | Login |
| `/registration` | Registration |
| `/user-profile` | UserProfile |
| `**` | NotFound |

**Ключевые сервисы:**
- `AuthService` — хранит access token в Angular signal (in-memory). `isLoggedIn` — computed signal. API base URL задан в `core/constants/api.constants.ts`.
- `ThemeService` — light/dark тема через signal, сохраняется в localStorage.

**UI:** Taiga UI v4 (`@taiga-ui/*`)

**i18n:** Transloco (`@jsverse/transloco`), языки `ru`/`en`, дефолт `ru`, сохраняется в localStorage. Каждый роут имеет собственный scope (файлы переводов в `assets/i18n/<scope>/`).

## Ветки и коммиты

**Формат ветки:**
- Backend: `(feat|fix|chore|docs|style|refactor|perf)/BACKEND_<Name>_<Description>`
- Frontend: `(feat|fix|chore|docs|style|refactor|perf)/FRONTEND_<Name>_<Description>`

Commitlint настроен через Husky. Conventional Commits для backend, Angular Conventional Commits для frontend.

## CI

GitHub Actions запускается на каждый PR. Проверки разделены по изменённым путям (`backend/**` / `frontend/**`):

**Backend CI:** `typecheck` → `ci:lint` → `ci:format` → `test` → `build`

**Frontend CI:** `typecheck` → `lint` → `ci:format` → `test` → `build`

## PR-шаблон

`.github/pull_request_template.md` — обязательно указывать связанный issue (`Fixes #N`) и тип изменений.
