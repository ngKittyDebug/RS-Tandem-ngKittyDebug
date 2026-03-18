# Review Plan — MeowVault

## Цель

Периодический code review студенческого проекта MeowVault для отслеживания прогресса команды. Каждый запуск создаёт/обновляет `CodeQualityStatus/code-review-backend.md` и `CodeQualityStatus/code-review-frontend.md` с оценками, замечаниями и сравнением с предыдущим ревью.

## Как запустить ревью

Скопировать в Claude Code:

```
Проведи code review по плану из REVIEW_PLAN.md
```

## Стратегия выполнения

### Шаг 1 — Параллельный анализ (2 агента в фоне)

Запустить два `feature-dev:code-reviewer` агента параллельно:

**Backend-агент:**
1. Начать с `backend/package.json`, `backend/tsconfig.json`, `backend/.env.example` — зависимости и конфигурация
2. Прочитать `backend/prisma/schema.prisma` — схема БД, модели, связи
3. Найти все `*.module.ts`, `*.controller.ts`, `*.service.ts` через Glob — структура приложения
4. Найти все `*.dto.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.filter.ts`, `*.pipe.ts` — слой валидации и middleware
5. Найти все `*.spec.ts` — тесты
6. Найти `shared/**/*.ts` — общие утилиты и паттерны
7. Прочитать `backend/src/main.ts` — bootstrap и глобальные настройки

**Frontend-агент:**
1. Начать с `frontend/package.json`, `frontend/angular.json`, `frontend/tsconfig.json` — конфигурация
2. Прочитать `frontend/src/app/app.config.ts` и `frontend/src/app/app.routes.ts` — провайдеры и маршрутизация
3. Найти все `*.ts` в `frontend/src/*` через Glob — сервисы, guards, interceptors, компоненты и т.д.
4. Найти все `*.ts` и `*.html` в `frontend/src/app/pages/` — страницы и шаблоны
5. Найти все `*.ts` и `*.html` в `frontend/src/app/shared/*` — переиспользуемое
6. Найти все `*.spec.ts` — тесты
7. Прочитать `frontend/src/index.html` и `frontend/src/styles.scss` — глобальные настройки
8. Проверить `frontend/public/i18n/` — файлы переводов

### Шаг 2 — Верификация (Read ключевых файлов)

После получения результатов от агентов — прочитать 10-15 ключевых файлов через `Read` tool для проверки номеров строк и контекста замечаний.

### Шаг 3 — Использовать Skills и Context7

Обогатить замечания актуальными best practices:

**Skills:**
- `angular-component` — standalone, signal inputs/outputs, host bindings, OnPush
- `angular-di` — inject(), injection tokens, provider configuration and scopes
- `angular-directives` — custom attribute/structural directives, host directives
- `angular-forms` — Signal Forms API (v21+), validation, field state management
- `angular-http` — resource(), httpResource(), HttpClient signal-based patterns
- `angular-migration` — AngularJS to Angular hybrid, incremental rewriting
- `angular-routing` — functional guards, lazy loading, route parameters with signals
- `angular-signals` — signal(), computed(), linkedSignal(), effect(), Service State Pattern
- `angular-testing` — Vitest/Jasmine, TestBed, testing signal components and DI
- `angular-tooling` — Angular CLI v20+, project setup, generation, build optimization
- `nestjs-best-practices` — security-auth-jwt, error-handling, arch-feature-modules
- `nestjs-testing-expert` — unit, integration, and e2e testing patterns with Jest
- `frontend-design` — frontend-design

**Context7 (актуальная документация):**
- `/nestjs/docs.nestjs.com` — NestJS official docs
- `/websites/v20_angular_dev` — Angular v20+ official docs
- `/prisma/docs` — Prisma documentation
- `/websites/transloco.ng` — Transloco i18n for Angular

### Шаг 4 — Обновить CODE_REVIEW.md

**No duplicates**: Check results for the already existing in context and skip any feedbacks already flagged by same or other agents.

Записать результаты в `CodeQualityStatus/code-review-backend.md` и `CodeQualityStatus/code-review-frontend.md`.

При повторном ревью:
1. Прочитать существующие `CodeQualityStatus/code-review-backend.md` и `CodeQualityStatus/code-review-frontend.md`
2. Сравнить с новыми находками
3. Пометить исправленные замечания как `[RESOLVED]`
4. Добавить новые замечания
5. Обновить оценки
6. Добавить строку в таблицу "История ревью"

## Структура CODE_REVIEW.md

### Backend

```markdown
# Backend Code Review — MeowVault
## Дата ревью: YYYY-MM-DD
## Общая оценка: X/10

## Сводная таблица оценок
| Категория | Оценка | Статус | Δ |

## 1. Архитектура и структура проекта
## 2. Безопасность
## 3. Качество кода и чистота
## 4. Обработка ошибок
## 5. База данных и Prisma
## 6. Тестирование
## 7. Конфигурация и DevOps
## 8. API дизайн и документация
## 9. Рекомендации к следующему ревью

## Ссылки на документацию
## История ревью
```

### Frontend

```markdown
# Frontend Code Review — MeowVault
## Дата ревью: YYYY-MM-DD
## Общая оценка: X/10

## Сводная таблица оценок
| Категория | Оценка | Статус | Δ |

## 1. Архитектура и структура проекта
## 2. Компоненты и Angular-паттерны
## 3. Управление состоянием (Signals, RxJS)
## 4. Формы и валидация
## 5. Безопасность (фронтенд)
## 6. i18n и локализация
## 7. Стили и UI/UX
## 8. Тестирование
## 9. Конфигурация и сборка
## 10. Рекомендации к следующему ревью

## Ссылки на документацию
## История ревью
```

## Формат оценки

Шкала 0-10:
- **0-3** — Критические проблемы, требуется переработка
- **4-6** — Существенные замечания, но основа правильная
- **7-8** — Хорошо, мелкие замечания
- **9-10** — Отлично, соответствует продакшн-стандартам

Severity замечаний:
- `[CRITICAL]` — нужно исправить обязательно
- `[MAJOR]` — важно исправить
- `[MINOR]` — желательно исправить
- `[SUGGESTION]` — рекомендация для улучшения
- `[RESOLVED]` — исправлено с предыдущего ревью

## Формат замечания

```markdown
### `[SEVERITY]` Краткое описание проблемы

**Файл:** `path/to/file.ts:line`

> **Правило `rule-name`** (Source, Priority): Краткая цитата правила. [Ссылка](url)

Описание проблемы с контекстом.

\`\`\`ts
// Проблемный код с номером строки
\`\`\`

**Исправление:**
\`\`\`ts
// Рекомендуемый код
\`\`\`
```

## Сравнение с предыдущим ревью (колонка Δ)

В таблице оценок добавить колонку `Δ`:
- `↑` — оценка выросла
- `↓` — оценка снизилась
- `=` — без изменений
- `NEW` — новая категория

## Шаг 5 — Коммит и PR

1. Создать ветку `docs/BACKEND_CodeReview_UpdateReviewDocuments` (или с инкрементным именем)
2. Коммит: `docs: update code review — YYYY-MM-DD (overall: X/10 backend, Y/10 frontend)`
3. PR в `develop` с summary изменений оценок

## Чеклист качества ревью

- [ ] Все упомянутые и новые файлы и строки существуют
- [ ] Каждое замечание содержит severity, файл:строку, описание, пример исправления
- [ ] Использованы ссылки на актуальную документацию (NestJS, Angular, Prisma)
- [ ] Применены правила и практики из skills (nestjs-best-practices, angular-component, angular-signals)
- [ ] Предыдущие замечания сверены — resolved/updated
- [ ] Таблица "История ревью" обновлена
- [ ] Markdown корректно рендерится
