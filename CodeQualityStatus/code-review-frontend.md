# Frontend Code Review — MeowVault

## Дата ревью: 2026-03-19

## Общая оценка: 5.0/10

С предыдущего ревью (2026-03-16): реализована **страница регистрации** с формой, валидаторами и обработкой ошибок. **Страница профиля** теперь содержит `ProfileSidebar`, `ProfileStats`, `RecentActivity` и `UserStore`. **Main** обновлена с описанием и карточками игр. Исправлен `provideTranslocoPersistLang` (`useFactory`), `lang="ru"`, `<title>MeowVault</title>`, `app.spec.ts`. `OnPush` добавлен в `Registration`, `Main`, `NotFound`. Однако обнаружена **критическая архитектурная ошибка**: `RegistrationService` дублирует `AuthService.register()` — после регистрации токен не попадает в `AuthService`, `isLoggedIn` остаётся `false`. Страницы профиля и main содержат захардкоженные данные. Большинство MAJOR-замечаний из предыдущих ревью не исправлены.

> **Источники best practices:** [Angular v20+ Docs](https://angular.dev), Angular Signals Skill, Angular Component Skill, [Taiga UI](https://taiga-ui.dev)

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 5/10 | Существенные замечания | ↓↓ |
| 2. Компоненты и Angular-паттерны | 5/10 | Существенные замечания | = |
| 3. Управление состоянием (Signals, RxJS) | 5/10 | Существенные замечания | = |
| 4. Формы и валидация | 5/10 | Существенные замечания | ↓ |
| 5. Безопасность (фронтенд) | 5/10 | Существенные замечания | ↑ |
| 6. i18n и локализация | 6/10 | Есть замечания | = |
| 7. Стили и UI/UX | 5/10 | Есть замечания | = |
| 8. Тестирование | 5/10 | Существенные замечания | ↑ |
| 9. Конфигурация и сборка | 5/10 | Существенные замечания | = |

---

## 1. Архитектура и структура проекта (5/10)

Появились новые компоненты и сервисы — функциональность растёт. Но критическая ошибка с дублированием регистрации ломает основной user flow.

### `[RESOLVED]` `provideTranslocoPersistLang` — `useFactory` вместо `useValue`

**Файл:** `src/app/app.config.ts:43-46`

```ts
provideTranslocoPersistLang({
  storage: { useFactory: () => localStorage },
}),
```

---

### `[RESOLVED]` `app.spec.ts` — тест заменён на реальную проверку

---

### `[RESOLVED]` Страница Registration — реализована полностью (была заглушкой)

**Файл:** `src/app/pages/registration/registration.ts`

Форма с username, email, password, passwordRepeat, кастомный `passwordsValidator`, Taiga UI компоненты, обработка ошибок.

---

### `[RESOLVED]` Страница UserProfile — реализована с компонентами

**Файл:** `src/app/pages/user-profile/`

`ProfileSidebar`, `ProfileStats`, `RecentActivity`, `UserStore` — полноценная структура.

---

### `[CRITICAL]` `RegistrationService` дублирует `AuthService.register()` — токен не попадает в `AuthService` — НОВОЕ

**Файл:** `src/app/core/services/register-service.ts`, `src/app/pages/registration/registration.ts:43,71`

> **Принцип DRY / Single Source of Truth:** `AuthService.register()` (строка 23 `auth-service.ts`) и `RegistrationService.register()` оба отправляют `POST /auth/register`. Но каждый хранит `accessToken` в **своём** приватном signal. Страница регистрации использует `RegistrationService` → после успешной регистрации `AuthService.isLoggedIn()` = `false`.

```ts
// register-service.ts — свой accessToken, изолирован от AuthService
private accessToken = signal<string | null>(null);
// registration.ts — использует RegistrationService
private registrationService = inject(RegistrationService);
await firstValueFrom(this.registrationService.register(User));
// После этого AuthService.isLoggedIn() === false!
```

**Исправление:** Удалить `RegistrationService`. Использовать `AuthService.register()` в странице регистрации:
```ts
private authService = inject(AuthService);
await firstValueFrom(this.authService.register(dto));
this.router.navigate([getRoutePath(AppRoute.MAIN)]);
```

---

### `[MAJOR]` Header всегда отображает аватар и кнопку logout без проверки авторизации — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/layout/header/header.html:10-28`

```html
<div class="user_bar">
  <tui-avatar ...>
  <button ...>{{ t('log-out') }}</button>
</div>
```

**Исправление:**
```html
@if (authService.isLoggedIn()) {
  <div class="user_bar">...</div>
} @else {
  <button tuiButton routerLink="/login">{{ t('login') }}</button>
}
```

---

### `[MAJOR]` Duplicate `LoginResponse` interface — НОВОЕ

**Файл:** `src/app/pages/registration/models/register.interfaces.ts`

Определён отдельный `LoginResponse`, идентичный `auth/models/auth.interfaces.ts`. Нарушение DRY.

**Исправление:** Использовать `LoginResponse` из `auth/models/auth.interfaces.ts`.

---

## 2. Компоненты и Angular-паттерны (5/10)

### `[MAJOR]` Опечатка `LaguageSwitcher` — НЕ ИСПРАВЛЕНО

**Файлы:** `core/components/language-switcher/language-switcher.ts:15`, `core/layout/header/header.ts:6,21`

```ts
export class LaguageSwitcher // должно быть LanguageSwitcher
```

**Исправление:** Переименовать класс, файл и все импорты.

---

### `[MAJOR]` Опечатка `AppTosterService` — НЕ ИСПРАВЛЕНО

**Файлы:** `core/services/app-toster-service.ts:21`, `pages/login/login.ts:27`, `pages/registration/registration.ts:16`

**Исправление:** Переименовать в `AppToasterService`, `TosterLabels` → `ToasterLabels`, `TosterAppearances` → `ToasterAppearances`.

---

### `[MAJOR]` Компоненты без `ChangeDetectionStrategy.OnPush` — НЕ ИСПРАВЛЕНО (частично)

OnPush добавлен в `Registration`, `Main`, `NotFound`, `LaguageSwitcher`, `ThemeSwitcher`. Отсутствует в:
`App`, `Header`, `Footer`, `UserProfile`, `Login`, `ProfileSidebar`, `ProfileStats`, `RecentActivity`, `ImgCat`.

> **Angular Component Skill:** `ChangeDetectionStrategy.OnPush` обязателен при использовании Signals. [Angular — Change detection](https://angular.dev/best-practices/skipping-subtrees)

---

### `[MAJOR]` `styleUrls` вместо `styleUrl` в нескольких компонентах — НОВОЕ

**Файлы:** `pages/registration/registration.ts:22`, `pages/main/main.ts:26`

> В Angular 19+ `styleUrls` (множ. число) для одного файла заменено на `styleUrl` (ед. число). [Angular Migration](https://angular.dev/reference/migrations/style-urls)

```ts
styleUrls: ['./registration.scss'], // устаревший API
```

**Исправление:** `styleUrl: './registration.scss'`

---

### `[MINOR]` `App` компонент содержит неиспользуемый signal `title` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/app.ts:15`

---

### `[MINOR]` `standalone: true` избыточно в Angular 21 — НЕ ИСПРАВЛЕНО

**Файлы:** `language-switcher.ts:9`, `theme-switcher.ts:8`, `not-found.ts:14`, `main.ts:12`, `registration.ts:23`

---

## 3. Управление состоянием (Signals, RxJS) (5/10)

### `[MAJOR]` `AuthService` — `isRefreshing` и `refreshSubject` публичные — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/auth/auth-service.ts:16-17`

```ts
public isRefreshing = false;
public refreshSubject = new BehaviorSubject<string | null>(null);
```

> [Angular — Services best practices](https://angular.dev/style-guide#services)

**Исправление:** Сделать `private` или перенести в приватный `AuthRefreshService`.

---

### `[MAJOR]` `LaguageSwitcher` использует мутабельные свойства вместо signals — НЕ ИСПРАВЛЕНО

**Файл:** `core/components/language-switcher/language-switcher.ts:18-20`

```ts
public currentLang: string | null = null;
public languages: string[] = [];
protected value: string | null = null;
```

Компонент с `OnPush`, но состояние в мутабельных полях — смена языка не вызовет повторный рендер.

---

### `[MINOR]` `AppTosterService` — подписки без управления жизненным циклом — НЕ ИСПРАВЛЕНО

**Файл:** `core/services/app-toster-service.ts`

`.subscribe()` без `takeUntilDestroyed`. Taiga alerts автозакрываются — риск минимален, но паттерн спорен.

---

## 4. Формы и валидация (5/10)

### `[CRITICAL]` Форма регистрации: нет `isLoading`, нет навигации после успеха, `throw Error` — НОВОЕ

**Файл:** `src/app/pages/registration/registration.ts:61-83`

> Множественные проблемы в `submit()`: (1) `throw new Error(...)` в `async` без внешнего `catch` = unhandled promise rejection. (2) Нет `isLoading` → возможна повторная отправка. (3) Нет навигации после успеха → пользователь остаётся на странице регистрации.

```ts
public async submit(): Promise<void> {
  if (!username || !email || !password)
    throw new Error(...); // unhandled rejection
  try {
    await firstValueFrom(this.registrationService.register(User));
    // нет навигации!
  } catch (error) { ... }
}
```

**Исправление:**
```ts
protected isLoading = signal(false);

protected async submit(): Promise<void> {
  if (this.registrationForm.invalid || this.isLoading()) return;
  this.isLoading.set(true);
  try {
    await firstValueFrom(this.authService.register(dto));
    this.router.navigate([getRoutePath(AppRoute.MAIN)]);
  } catch (error) { /* обработка */ }
  finally { this.isLoading.set(false); }
}
```

---

### `[MAJOR]` Login проверяет HTTP 403 вместо 401 — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/login/login.ts:119`

```ts
const key = error.status === 403 ? 'login.error.invalidCredentials' : 'login.error.serverError';
```

**Исправление:** `403` → `401` (синхронно с исправлением backend).

---

### `[MINOR]` `getInputError` вызывается как метод в шаблоне — НЕ ИСПРАВЛЕНО

**Файлы:** `login.html:49,62,77`, `registration.html:24,29,41,53`

Метод с `translocoService.translate()` вызывается при каждом цикле change detection.

**Исправление:** Заменить на `computed()` signals.

---

### `[MINOR]` `autocomplete="current-password"` на полях регистрации — НОВОЕ

**Файл:** `src/app/pages/registration/registration.html:36,48`

> [MDN: autocomplete values](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values): при регистрации — `new-password`.

**Исправление:** `autocomplete="new-password"` для обоих полей пароля.

---

## 5. Безопасность (фронтенд) (5/10)

### `[CRITICAL]` `ThemeService` обращается к `localStorage` при конструировании — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/theme-service.ts:9`

```ts
private baseTheme = localStorage.getItem(STORAGE_KEYS.THEME) || ThemeNames.Light;
```

> [Angular — SSR](https://angular.dev/guide/ssr)

**Исправление (SSR-safe):**
```ts
constructor() {
  const doc = inject(DOCUMENT);
  const stored = doc.defaultView?.localStorage.getItem(STORAGE_KEYS.THEME);
  this.theme = signal(stored ?? ThemeNames.Light);
}
```

---

### `[MAJOR]` Main — внешний CDN URL для иконки — НОВОЕ

**Файл:** `src/app/pages/main/main.html:13`

> Внешний CDN нарушает CSP, создаёт зависимость от третьей стороны, не работает offline. [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

```html
<tui-icon icon="https://cdn-icons-png.flaticon.com/64/12710/12710759.png" class="hover" />
```

**Исправление:** Сохранить иконку локально в `public/assets/icons/`.

---

## 6. i18n и локализация (6/10)

### `[RESOLVED]` `index.html` — `lang="ru"`

### `[RESOLVED]` `<title>MeowVault</title>`

---

### `[MINOR]` Hardcoded `'...'` вместо i18n-ключа — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/login/login.html:87`

---

### `[MINOR]` Неиспользуемые ключи перевода — НЕ ИСПРАВЛЕНО

**Файлы:** `public/i18n/login/ru.json` — `loginWorks`, `buttons.google`, `divider`

---

### `[MINOR]` Опечатка `mismathPassword` в переводах — НОВОЕ

**Файл:** `public/i18n/user-profile/ru.json:45`, `en.json:45`

```json
"mismathPassword": "Пароли не совпадают"
```

`mismath` → `mismatch`. В `registration/ru.json` ключ написан правильно: `passwordMismatch`.

---

### `[MAJOR]` Захардкоженные строки в UserProfile без i18n — НОВОЕ

**Файлы:** `profile-sidebar.html:25-26`, `profile-stats.html`, `recent-activity.html`

Жанры `"Racing"`, `"Puzzle"`, числа `127`, `45,820`, `32`, время `"2"`, `"5"` — всё захардкожено на английском или без привязки к данным.

---

## 7. Стили и UI/UX (5/10)

### `[MAJOR]` `ThemeSwitcher` — checkbox не привязан к текущей теме — НЕ ИСПРАВЛЕНО

**Файл:** `core/components/theme-switcher/theme-switcher.html:1`

```html
<input tuiLike type="checkbox" (change)="onChangeTheme()" />
```

**Исправление:** `[checked]="themeService.theme() === ThemeNames.Dark"`

---

### `[MAJOR]` Main — 6 захардкоженных карточек-заглушек с `"Replace me"` — НОВОЕ

**Файл:** `src/app/pages/main/main.html:31-97`

6 копипастных блоков с `<section>Replace me</section>`. Заглушечный контент в production-коде.

**Исправление:** Создать массив данных об играх (или получать из API) и рендерить через `@for`.

---

### `[MINOR]` Кнопка "Начать" без действия — НОВОЕ

**Файл:** `src/app/pages/main/main.html:26-28`

```html
<button appearance="secondary" tuiButton type="button" [size]="size" class="reg-button">
  {{ t('main.button.start') }}
</button>
```

Нет `routerLink`, нет `(click)` — мёртвый элемент.

---

### `[SUGGESTION]` `console.log` в обработчике ошибки logout — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/layout/header/header.ts:41`

**Исправление:** `appTosterService.showErrorToster(...)` с переведённым сообщением.

---

## 8. Тестирование (5/10)

Значительный прогресс: реальные тесты для `AuthService`, Guards, `ProfileSidebar`, `UserService`. Но ключевая логика интерцептора и новых компонентов не покрыта.

### `[CRITICAL]` Большинство spec-файлов — smoke-тесты — НЕ ИСПРАВЛЕНО (частично)

Реальные тесты добавлены для `AuthService`, `AuthGuard`, `GuestGuard`, `Header`, `AppTosterService`, `ProfileSidebar`, `UserService`. Остаются smoke-уровня: `auth-interceptor.spec.ts`, `theme-service.spec.ts`, `login.spec.ts`, `registration.spec.ts`, `footer.spec.ts`, `img-cat.spec.ts`, `profile-stats.spec.ts`, `recent-activity.spec.ts`, `user-store.spec.ts`.

Интерцептор (добавление Bearer, обработка 401, queue, retry) — ни одного значимого теста.

---

### `[MAJOR]` `register-service.spec.ts` — describe называется `'AuthService'` — НОВОЕ

**Файл:** `src/app/core/services/register-service.spec.ts:4`

```ts
describe('AuthService', () => { // должно быть 'RegistrationService'
  let service: RegistrationService;
```

---

### `[MINOR]` Опечатка `ThemeSwither` в `theme-switcher.spec.ts` — НЕ ИСПРАВЛЕНО

**Файл:** `core/components/theme-switcher/theme-switcher.spec.ts:6`

---

## 9. Конфигурация и сборка (5/10)

### `[MAJOR]` `validate-branch-name` — production dependency вместо dev — НЕ ИСПРАВЛЕНО

**Файл:** `package.json`

---

### `[MAJOR]` `dotenv` — не используемый production dependency — НЕ ИСПРАВЛЕНО

**Файл:** `package.json`

---

### `[MINOR]` `EyeCompassDirective` — не используется ни в одном компоненте — НОВОЕ

**Файл:** `src/app/core/directive/eye-compass.directive.ts`

Директива реализована для `[data-pupil]`, но в `registration.html` SVG использует `#pupil` (template ref) — директива никогда не активируется.

---

## 10. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Удалить `RegistrationService` — использовать `AuthService.register()` на странице регистрации
- [ ] Исправить `ThemeService` — SSR-safe через `inject(DOCUMENT)`
- [ ] Добавить `isLoading`, навигацию после успеха, убрать `throw new Error` в форме регистрации
- [ ] Скрыть `user_bar` в Header для неавторизованных + кнопка входа

### Приоритет 2 (важно)
- [ ] Переименовать `LaguageSwitcher` → `LanguageSwitcher`
- [ ] Переименовать `AppTosterService` → `AppToasterService`
- [ ] Добавить `OnPush` во все компоненты без него
- [ ] Перенести `isRefreshing`/`refreshSubject` в `private`
- [ ] Привязать `[checked]` checkbox к теме в `ThemeSwitcher`
- [ ] Изменить `error.status === 403` → `401` в login
- [ ] Заменить "Replace me" карточки на данные из массива/API
- [ ] Убрать внешний CDN URL — сохранить иконку локально
- [ ] Перенести `validate-branch-name` и `dotenv` в `devDependencies`
- [ ] Перевести `LaguageSwitcher` на signals
- [ ] Заменить `styleUrls` → `styleUrl`
- [ ] Удалить дублирующий `LoginResponse` из `register.interfaces.ts`
- [ ] Захардкоженные данные в профиле заменить на данные из API

### Приоритет 3 (желательно)
- [ ] Удалить `console.log` в `header.ts:41`
- [ ] Удалить мёртвый `title` signal в `App`
- [ ] Заменить `getInputError` method binding на `computed()`
- [ ] Исправить `autocomplete="current-password"` → `"new-password"` в регистрации
- [ ] Исправить опечатку `mismathPassword` в переводах
- [ ] Добавить действие кнопке "Начать" на Main
- [ ] Добавить реальные тесты для интерцептора
- [ ] Исправить опечатку `ThemeSwither` в спеке
- [ ] Удалить избыточный `standalone: true`
- [ ] Удалить неиспользуемую `EyeCompassDirective` или подключить
- [ ] Исправить `register-service.spec.ts` describe name

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| Angular v20 Route Guards | https://angular.dev/guide/routing/route-guards |
| Angular Signals | https://angular.dev/guide/signals |
| Angular OnPush + Signals | https://angular.dev/best-practices/skipping-subtrees |
| Angular SSR / DOCUMENT | https://angular.dev/guide/ssr |
| Angular Style Guide | https://angular.dev/style-guide |
| Angular styleUrl migration | https://angular.dev/reference/migrations/style-urls |
| MDN CSP | https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP |
| MDN autocomplete | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete |
| Taiga UI Components | https://taiga-ui.dev |
| Transloco | https://jsverse.github.io/transloco |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 4.5/10 | 6 | 8 | 9 |
| 2026-03-09 | 4.5/10 | 6 | 8 | 8 |
| 2026-03-16 | 5.5/10 | 2 | 7 | 7 |
| 2026-03-19 | 5.0/10 | 3 | 14 | 11 |
