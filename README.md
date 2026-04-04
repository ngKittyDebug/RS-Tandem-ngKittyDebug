# MeowVault

## 🐾 О проекте

**MeowVault** — это уютный учебный каталог с несколькими играми, которые помогают прокачать знания JavaScript, TypeScript и подготовиться к техническому интервью 🐾😸 Пользователь учится через практику и небольшие игровые задания, без стресса и перегруза 🎮🐱 Обучение здесь такое же мягкое и приятное, как котик, который поддерживает тебя лапкой перед собеседованием 🐈💛

**Ссылка на демо:** [demo]()

## 🌟 Чем гордимся:

Наша сильная сторона - грамотное распределение ролей в команде и выстроенная коммуникация между участниками. Это помогло нам работать согласованно, быстро принимать решения и не терять общий темп разработки. Отдельно гордимся тем, что реализовали собственный кастомный бэкенд и при этом сохранили единый стиль проекта. Также важно, что мы впервые работали с Angular, но смогли быстро разобраться в технологии и выстроить понятную, целостную архитектуру.

## 👥 Состав команды

| Роль                           | Имя     | Github                                                | Дневник                                                                                                       |
| ------------------------------ | ------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Frontend Developer / Team lead | Мария   | [WhaleisaJoy](https://github.com/WhaleisaJoy)         | [дневник](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/development-notes/whaleisajoy)     |
| Frontend Developer             | Алена   | [Alena1409](https://github.com/Alena1409)             | [дневник](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/development-notes/alena1409)       |
| Backend Developer              | Алексей | [AlexGorSer](https://github.com/AlexGorSer)           | [дневник](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/development-notes/AlexGorSer)      |
| Frontend Developer             | Надежда | [kozochkina82](https://github.com/kozochkina82)       | [дневник](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/development-notes/kozochkina82)    |
| Frontend Developer             | Оксана  | [Oksi2510](https://github.com/Oksi2510)               | [дневник](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/development-notes/Oksi2510)        |
| Frontend Developer             | Павел   | [pavelkuvsh1noff](https://github.com/pavelkuvsh1noff) | [дневник](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/development-notes/pavelkuvsh1noff) |

## 🚀 Deployment

Ссылка на deploy: [MeowVault](https://meowvault.netlify.app/)

## ⚡Getting Started

1. Склонировать проект

   ```
   git clone https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug.git
   ```

### Backend Local Setup

Чтобы запустить backend-часть проекта локально следуйте инструкции: [инструкция](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/blob/main/backend/README.md#%D0%B1%D1%8B%D1%81%D1%82%D1%80%D1%8B%D0%B9-%D1%81%D1%82%D0%B0%D1%80%D1%82)

### Frontend Local Setup

Чтобы запустить frontend-часть проекта локально:

1. Перейдите в папку `frontend`:

   ```bash
   cd frontend
   ```

2. Установите зависимости:

   ```bash
   npm ci
   ```

   p.s. `npm ci` мы использовали, чтобы была воспроизводимая, детерминированная установка приложения, с зафиксированными версиями зависимостей в проекте

3. Создайте файл `.env` на основе `.env.example` и укажите ссылку на backend для `NG_APP_API_URL`.

4. Запустите локальный сервер разработки:

   ```bash
   npm start
   ```

5. Откройте приложение в браузере:

   ```text
   http://localhost:4200/
   ```

   Frontend запускается в режиме разработки через Angular CLI и автоматически перезагружается при изменении файлов.

### Additional Commands

Проверка типов:

```bash
npm run typecheck
```

Проверка линтера:

```bash
npm run lint
```

Запуск тестов:

```bash
npm run test
```

Полная проверка проекта:

```bash
npm run check-all
```

## 🛠️ Tech Stack

### Frontend

- Angular 21
- TypeScript
- RxJS
- Angular Signals
- Reactive Forms
- Taiga UI
- Transloco
- SCSS
- Angular CLI
- `@ngx-env/builder` for environment configuration

### Backend

- NestJS 11
- TypeScript
- Prisma ORM
- PostgreSQL / Supabase
- JWT authentication
- Passport.js
- GitHub OAuth
- Swagger / OpenAPI
- `class-validator` + `class-transformer`
- `cookie-parser`
- cross-env

### Testing & Code Quality

- Vitest
- Jest
- Supertest
- ESLint
- Prettier
- Husky
- Commitlint
- lint-staged

### Infrastructure & Tooling

- Docker
- [CI/CD](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/tree/main/.github/workflows)

## 🎯 Task Planning and Tracking

Инструмент для планирования и отслеживания работы: [Github Projects](https://github.com/orgs/ngKittyDebug/projects/1)

![alt text](/meeting-notes/assets/image.png)

## 🔀 PR

### Шаблон для PR

```
## Описание изменений
<!-- Опишите, что именно вы изменили и зачем. Если есть связанные задачи или баги, укажите их здесь -->

## Связанная задача (issue)
<!-- Укажите номер задачи, например: Fixes #123, Closes #456 -->
Fixes #

## Тип изменений
<!-- Отметьте нужные варианты, убрав пробел в скобках [ ] и поставив x: [x] -->
- [ ] 🐛 Исправление бага (неразрушающее изменение, которое исправляет проблему)
- [ ] ✨ Новая функция (неразрушающее изменение, добавляющее функционал)
- [ ] 📚 Обновление документации
- [ ] 🎨 Рефакторинг кода
- [ ] ✅ Добавление/обновление тестов
- [ ] 🔧 Изменения в конфигурации/инфраструктуре


## Скриншоты (если применимо)
<!-- Для UI-изменений добавьте скриншоты "до" и "после" -->
```

### 🌿 Branch Strategy

В проекте используются три основные ветки:

- `main` — стабильная production-ветка
- `develop` — основная ветка для разработки
- `development-notes` — ветка с дневниками разработки

#### 🪴 Именование рабочих веток

Для feature- и service-веток используется следующий формат:

```
<prefix>/<role>_<scope>_<short-description>
```

Пример:

```text
feat/FRONTEND_authLogin_formValidation
```

#### 🏷️ Допустимые роли

- `FRONTEND`
- `BACKEND`

#### 🏷️ Допустимые префиксы веток

- `chore` — служебные изменения и поддержка проекта
- `feat` — новая функциональность
- `fix` — исправление ошибок
- `docs` — изменения в документации
- `style` — изменения форматирования и стилей без изменения логики
- `refactor` — рефакторинг без изменения поведения
- `perf` — улучшение производительности

#### ✅ Допустимые типы коммитов

При создании коммитов используются следующие типы:

- `ci`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`
- `test`
- `chore`
- `build`

### ✨ Лучшие PR

| PR                                                                      | Суть ревью                                     | Почему выбран                                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [#54](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/pull/54)   | UX + логика + тесты                            | Комментарии привели к изменениям поведения (toaster), доработке сервиса и добавлению тестов |
| [#24](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/pull/24)   | Глубокий multi-file review (i18n, UI, сервисы) | Затронуты разные слои (переводы, стили, сервисы)                                            |
| [#36](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/pull/36)   | Архитектура + структура приложения             | Есть обсуждение архитектуры (API сервис), несколько итераций правок.                        |
| [#136](https://github.com/ngKittyDebug/RS-Tandem-ngKittyDebug/pull/136) | AI-логика Merge Game + Swagger + валидация     | Доработка API, Swagger и логики обработки ошибок                                            |

## 📝 Meeting Notes

Ссылка: [Meeting Notes](/meeting-notes/)

## 📹 404, loading, error state

В видео демонстрируются следующие реализованные фичи:

- **Страница 404**:
  При переходе на несуществующий URL отображается кастомная страница. Доступна кнопка для возврата назад.

- **Loading state**:
  При загрузке данных (API-запросы, переходы между страницами) отображается индикатор загрузки:
  крутящийся котик.

- **Обработка ошибок API**:
  При ошибке сети или сервера пользователь видит понятное сообщение.

Ссылка на видео: [link](https://youtu.be/FcmFwwk1PUg)
