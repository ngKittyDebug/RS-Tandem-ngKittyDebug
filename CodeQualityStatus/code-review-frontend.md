# Frontend Code Review — MeowVault

## Дата ревью: 2026-03-16

## Общая оценка: 5.5/10

С предыдущего ревью (2026-03-09): реализованы **ключевые архитектурные элементы** — `AuthGuard`, `GuestGuard`, HTTP Interceptor с поддержкой token refresh, `provideAppInitializer` для восстановления сессии при перезагрузке. Исправлен `header.scss` grid layout. Добавлены тесты для `AuthService`, Guards, `Header`, `AppTosterService`. Это значительный прогресс в архитектуре. Критические SSR-несовместимости `ThemeService` и `provideTranslocoPersistLang` остаются нетронутыми. Большинство MAJOR-замечаний не исправлены.

> **Источники best practices:** [Angular v20+ Docs](https://angular.dev), Angular Signals Skill, Angular Component Skill, [Taiga UI](https://taiga-ui.dev)

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 7/10 | Есть замечания | ↑↑ |
| 2. Компоненты и Angular-паттерны | 5/10 | Существенные замечания | = |
| 3. Управление состоянием (Signals, RxJS) | 5/10 | Существенные замечания | = |
| 4. Формы и валидация | 6/10 | Есть замечания | = |
| 5. Безопасность (фронтенд) | 4/10 | Существенные замечания | ↑↑ |
| 6. i18n и локализация | 6/10 | Есть замечания | = |
| 7. Стили и UI/UX | 5/10 | Есть замечания | = |
| 8. Тестирование | 4/10 | Существенные замечания | ↑ |
| 9. Конфигурация и сборка | 5/10 | Существенные замечания | = |

---

## 1. Архитектура и структура проекта (7/10)

Реализованы критически важные элементы auth-flow. Структура приближается к production-стандартам.

### `[RESOLVED]` AuthGuard для `/user-profile` реализован

**Файл:** `src/app/app.routes.ts:39`

```ts
canActivate: [authGuard],
```

Создан `core/guards/auth-guard.ts` с `CanActivateFn` — корректный функциональный guard Angular 20+.

> [Angular — Route Guards](https://angular.dev/guide/routing/route-guards)

---

### `[RESOLVED]` GuestGuard добавлен для `/login` и `/registration`

**Файл:** `src/app/app.routes.ts:27,33`

```ts
canActivate: [guestGuard],
```

Авторизованный пользователь не попадёт на страницы входа/регистрации.

---

### `[RESOLVED]` HTTP Interceptor с Authorization header реализован

**Файл:** `src/app/app.config.ts:27`

```ts
provideHttpClient(withInterceptors([authInterceptor])),
```

Интерцептор добавляет `Bearer` токен и обрабатывает 401 с очередью pending-запросов.

---

### `[RESOLVED]` `provideAppInitializer` — сессия восстанавливается при перезагрузке

**Файл:** `src/app/app.config.ts:42-45`

```ts
provideAppInitializer(() => {
  const authService = inject(AuthService);
  return authService.refresh().pipe(catchError(() => of(void 0)));
}),
```

> [Angular — APP_INITIALIZER](https://angular.dev/api/core/APP_INITIALIZER)

---

### `[MAJOR]` Header всегда отображает аватар и кнопку logout без проверки авторизации — НОВОЕ

**Файл:** `src/app/core/layout/header/header.html:10-28`

```html
<div class="user_bar">
  <tui-avatar ...>
  <button ...>{{ t('log-out') }}</button>
</div>
```

Неавторизованный пользователь видит кнопку "Log out" и аватар. Клик на аватар вызывает навигацию на `/user-profile`, которая редиректит на `/login` через `authGuard` — UX запутывает. Нет кнопки "Войти" для гостей.

**Исправление:** Инжектировать `AuthService` в компонент и использовать `@if`:
```html
@if (authService.isLoggedIn()) {
  <div class="user_bar">...</div>
} @else {
  <button routerLink="/login">{{ t('login') }}</button>
}
```

---

### `[MAJOR]` 3 из 5 страниц — пустые заглушки — НЕ ИСПРАВЛЕНО (частично)

**Файлы:** `pages/main/main.html`, `pages/registration/registration.html`, `pages/user-profile/user-profile.html`

Login реализован полностью. Три страницы рендерят debug-текст через `t('*.mainWorks')` / `t('*.registrationWorks')`.

---

## 2. Компоненты и Angular-паттерны (5/10)

### `[MAJOR]` Опечатка в имени класса: `LaguageSwitcher` — НЕ ИСПРАВЛЕНО

**Файлы:**
- `core/components/language-switcher/language-switcher.ts:15`
- `core/layout/header/header.ts:6,21`
- `core/components/language-switcher/language-switcher.spec.ts:4-8`

```ts
export class LaguageSwitcher // должно быть LanguageSwitcher
```

**Исправление:** Переименовать класс, файл и все импорты.

---

### `[MAJOR]` Опечатка в имени сервиса: `AppTosterService` — НЕ ИСПРАВЛЕНО

**Файлы:**
- `core/services/app-toster-service.ts:21`
- `pages/login/login.ts:27,57`

```ts
export class AppTosterService // должно быть AppToasterService
```

**Исправление:** Переименовать сервис, enum `TosterLabels`/`TosterAppearances`, файл и все импорты.

---

### `[MAJOR]` Большинство компонентов без `ChangeDetectionStrategy.OnPush` — НЕ ИСПРАВЛЕНО (частично)

OnPush добавлен только в `LaguageSwitcher` и `ThemeSwitcher`. Отсутствует в:
`App`, `Header`, `Footer`, `Login`, `Registration`, `UserProfile`, `Main`, `NotFound`, `ImgCat`.

> **Angular Component Skill:** `ChangeDetectionStrategy.OnPush` — обязателен при использовании Signals. [Angular — Change detection](https://angular.dev/best-practices/skipping-subtrees)

**Исправление:** Добавить `changeDetection: ChangeDetectionStrategy.OnPush` во все компоненты.

---

### `[MINOR]` `App` компонент содержит неиспользуемый signal `title` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/app.ts:15`

```ts
protected readonly title = signal('frontend');
```

Не используется ни в шаблоне, ни в логике.

---

### `[SUGGESTION]` `standalone: true` избыточно в Angular 21 — НЕ ИСПРАВЛЕНО

**Файлы:** `language-switcher.ts:9`, `theme-switcher.ts:8`

В Angular 19+ все компоненты standalone по умолчанию. Явное указание — шум.

> [Angular 19 — Standalone default](https://angular.dev/reference/releases#standalone-components-are-default)

---

## 3. Управление состоянием (Signals, RxJS) (5/10)

### `[MAJOR]` `AuthService` — `isRefreshing` и `refreshSubject` публичные — НОВОЕ

**Файл:** `src/app/core/services/auth/auth-service.ts:16-17`

```ts
public isRefreshing = false;
public refreshSubject = new BehaviorSubject<string | null>(null);
```

Детали реализации логики token refresh вынесены в `public` поля. Любой компонент может случайно изменить `isRefreshing` или засорить `refreshSubject`, сломав очередь запросов.

> [Angular — Services best practices](https://angular.dev/style-guide#services)

**Исправление:** Перенести `isRefreshing` и `refreshSubject` в отдельный приватный `AuthRefreshService` (или сделать их `private` с геттерами если они нужны только интерцептору через injection).

---

### `[MAJOR]` `LaguageSwitcher` использует мутабельные свойства вместо signals — НЕ ИСПРАВЛЕНО

**Файл:** `core/components/language-switcher/language-switcher.ts:18-20`

```ts
public currentLang: string | null = null;
public languages: string[] = [];
protected value: string | null = null;
```

Компонент имеет `OnPush`, при этом состояние хранится в мутабельных полях. Смена языка не вызовет повторный рендер.

> [Angular — Signals](https://angular.dev/guide/signals)

**Исправление:**
```ts
protected readonly value = signal(this.translocoService.getActiveLang());
protected readonly languages = signal(
  this.translocoService.getAvailableLangs()
    .map(lang => typeof lang === 'string' ? lang : lang.id)
);
```

---

### `[MINOR]` `AppTosterService` — подписки без управления жизненным циклом — НЕ ИСПРАВЛЕНО

**Файл:** `core/services/app-toster-service.ts:30-32`

```ts
this.alerts.open(message, { ... }).subscribe(); // нет takeUntilDestroyed
```

> [RxJS — Subscription management](https://rxjs.dev/guide/subscription)

---

### `[SUGGESTION]` `AuthService` — рекомендуется `asReadonly()` для публичных writable signals

> **Angular Signals Skill — Service State Pattern:** приватный writable signal + публичный readonly.

---

## 4. Формы и валидация (6/10)

Страница логина реализована качественно: Reactive Forms, переключение режимов email/username, динамическая смена валидаторов, `finalize` для loading state, `takeUntilDestroyed` для cleanup.

### `[MAJOR]` Login проверяет HTTP 403 вместо 401 для невалидных credentials — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/login/login.ts:119`

```ts
const key = error.status === 403 ? 'login.error.invalidCredentials' : 'login.error.serverError';
```

Бэкенд возвращает 401 при неверных данных. Этот код всегда покажет пользователю "Ошибка сервера" вместо "Неверные учётные данные".

> [MDN — HTTP 401](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401)

**Исправление:** Заменить `403` на `401` (синхронно с исправлением backend).

---

### `[MINOR]` `getInputError` вызывается в шаблоне как метод — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/login/login.html:49,62,77`

```html
<tui-error [error]="getInputError('email')"></tui-error>
```

Метод с `translocoService.translate()` вызывается при каждом цикле change detection.

**Исправление:** Заменить на `computed()` signals.

---

## 5. Безопасность (фронтенд) (4/10)

### `[RESOLVED]` Token refresh при загрузке — сессия восстанавливается через `provideAppInitializer`

**Файл:** `src/app/app.config.ts:42-45`

Пользователь остаётся авторизованным после F5.

---

### `[CRITICAL]` `ThemeService` обращается к `localStorage` при конструировании — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/theme-service.ts:9`

```ts
private baseTheme = localStorage.getItem(STORAGE_KEYS.THEME) || ThemeNames.Light;
```

Прямой вызов `localStorage` как инициализатора поля разрушит приложение в SSR/prerendering и нарушает принцип инъекции платформо-зависимых API.

> [Angular — SSR](https://angular.dev/guide/ssr)

**Исправление (SSR-safe):**
```ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  public readonly theme: WritableSignal<string>;

  constructor() {
    const stored = this.doc.defaultView?.localStorage.getItem(STORAGE_KEYS.THEME);
    this.theme = signal(stored ?? ThemeNames.Light);
  }
}
```

---

### `[CRITICAL]` `provideTranslocoPersistLang` с `useValue: localStorage` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/app.config.ts:38-41`

```ts
provideTranslocoPersistLang({
  storage: { useValue: localStorage }, // ← SSR crash
}),
```

`localStorage` вычисляется в момент инициализации модуля — `ReferenceError: localStorage is not defined` в серверной среде.

> [Angular Universal — Common issues](https://angular.dev/guide/ssr#common-issues)

**Исправление:** `storage: { useFactory: () => localStorage }`

---

## 6. i18n и локализация (6/10)

### `[MINOR]` Hardcoded `'...'` вместо i18n-ключа — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/login/login.html:87`

```html
{{ isLoading() ? '...' : t('login.buttons.login') }}
```

**Исправление:** Добавить ключ `login.buttons.loading` в файлы переводов.

---

### `[MINOR]` `index.html` — `lang="en"` при дефолтном языке `ru` — НЕ ИСПРАВЛЕНО

**Файл:** `src/index.html:2`

Влияет на скринридеры и поисковую индексацию. Дефолт по CLAUDE.md — `ru`.

> [WCAG 3.1.1 — Language of page](https://www.w3.org/WAI/WCAG21/Understanding/language-of-page), [MDN — lang](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)

**Исправление:** `lang="ru"`

---

### `[MINOR]` `<title>Frontend</title>` вместо `MeowVault` — НЕ ИСПРАВЛЕНО

**Файл:** `src/index.html:5`

**Исправление:** `<title>MeowVault</title>`

---

### `[MINOR]` Неиспользуемые ключи перевода — НЕ ИСПРАВЛЕНО

**Файлы:** `public/i18n/login/ru.json`, `public/i18n/login/en.json`

Ключи `loginWorks`, `buttons.google`, `divider` присутствуют в переводах, но не используются в шаблоне.

---

## 7. Стили и UI/UX (5/10)

### `[RESOLVED]` Header grid layout исправлен

**Файл:** `core/layout/header/header.scss`

Grid теперь `1fr auto auto` — логотип не занимает половину ширины.

---

### `[MAJOR]` `ThemeSwitcher` — checkbox не привязан к текущей теме — НЕ ИСПРАВЛЕНО

**Файл:** `core/components/theme-switcher/theme-switcher.html:1`

```html
<input tuiLike type="checkbox" (change)="onChangeTheme()" />
```

Отсутствует `[checked]`. После перезагрузки с тёмной темой checkbox всегда в состоянии "unchecked".

**Исправление:** Добавить `[checked]="themeService.theme() === ThemeNames.Dark"`.

---

### `[SUGGESTION]` `console.log` в обработчике ошибки logout в Header — НОВОЕ

**Файл:** `src/app/core/layout/header/header.ts:41`

```ts
error: (error) => {
  console.log(error);
},
```

`console.log` в production-коде. Ошибка не показывается пользователю.

**Исправление:** Заменить на `appTosterService.showErrorToster(...)` с переведённым сообщением.

---

## 8. Тестирование (4/10)

С предыдущего ревью добавлены реальные тесты для `AuthService`, `AuthGuard`, `GuestGuard`, `Header`, `AppTosterService`. Это значительное улучшение.

### `[RESOLVED]` Добавлены тесты для `AuthService`

Тесты проверяют `login()`, `register()`, `logout()`, `refresh()`, `isLoggedIn`.

---

### `[RESOLVED]` Добавлены тесты для Guards

`AuthGuard` и `GuestGuard` покрыты тестами с проверкой редиректа.

---

### `[CRITICAL]` Большинство spec-файлов по-прежнему только smoke-тесты — НЕ ИСПРАВЛЕНО (частично)

**Файлы:** `auth-interceptor.spec.ts`, `theme-service.spec.ts`, `login.spec.ts`, `registration.spec.ts`, `not-found.spec.ts`, `footer.spec.ts`, `img-cat.spec.ts`

Ключевая логика интерцептора (добавление Bearer токена, обработка 401, queue pending requests, retry после refresh) не покрыта ни одним тестом.

---

### `[MINOR]` `app.spec.ts` — perma-skipped тест с некорректным assertion — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/app.spec.ts:30`

```ts
it.skip('should render title', async () => {
  expect(compiled.querySelector('p')?.textContent).toContain('main works!');
```

**Исправление:** Удалить или обновить тест.

---

### `[MINOR]` `ThemeSwitcher.spec.ts` — опечатка в `describe` — НЕ ИСПРАВЛЕНО

**Файл:** `core/components/theme-switcher/theme-switcher.spec.ts:6`

```ts
describe('ThemeSwither', () => { // ← пропущена 'c'
```

---

## 9. Конфигурация и сборка (5/10)

### `[MAJOR]` `validate-branch-name` — production dependency вместо dev — НЕ ИСПРАВЛЕНО

**Файл:** `package.json:51`

Git hooks инструмент попадает в production `node_modules`.

**Исправление:** Перенести в `devDependencies`.

---

### `[MAJOR]` `dotenv` — не используемый production dependency — НЕ ИСПРАВЛЕНО

**Файл:** `package.json:48`

`dotenv` — серверный инструмент для Node.js. Angular CLI + `@ngx-env/builder` обрабатывают env самостоятельно.

**Исправление:** Удалить или перенести в `devDependencies`.

---

### `[SUGGESTION]` `@angular/cdk` — проверить дублирование в deps — частично RESOLVED

Дубликата в `devDependencies` не обнаружено. Рекомендуется периодически проверять при обновлениях.

---

## 10. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Исправить `ThemeService` — SSR-safe через `inject(DOCUMENT)`
- [ ] Исправить `provideTranslocoPersistLang` — `useFactory` вместо `useValue`
- [ ] Скрыть `user_bar` в Header для неавторизованных пользователей + добавить кнопку входа
- [ ] Перенести `isRefreshing`/`refreshSubject` из `AuthService` в приватный refresh-сервис или сделать их `private`

### Приоритет 2 (важно)
- [ ] Исправить опечатку `LaguageSwitcher` → `LanguageSwitcher`
- [ ] Исправить опечатку `AppTosterService` → `AppToasterService`
- [ ] Добавить `ChangeDetectionStrategy.OnPush` во **все** компоненты
- [ ] Реализовать страницу Registration (форма регистрации)
- [ ] Привязать `[checked]` checkbox к текущей теме в `ThemeSwitcher`
- [ ] Изменить `error.status === 403` → `401` в login
- [ ] Перенести `validate-branch-name` и `dotenv` из `dependencies`
- [ ] Перевести `LaguageSwitcher` на signals

### Приоритет 3 (желательно)
- [ ] Удалить `console.log` в `header.ts:41` → заменить на `AppTosterService`
- [ ] Удалить мёртвый `title` signal в `App`
- [ ] Исправить `<html lang="en">` → `lang="ru"` в `index.html`
- [ ] Исправить `<title>Frontend</title>` → `MeowVault`
- [ ] Заменить `getInputError` method binding на `computed()` signals
- [ ] Добавить реальные тесты для интерцептора (Bearer токен, retry на 401)
- [ ] Удалить или обновить skipped тест в `app.spec.ts`
- [ ] Исправить опечатку `'ThemeSwither'` в `theme-switcher.spec.ts`
- [ ] Удалить избыточный `standalone: true`

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| Angular v20 Route Guards | https://angular.dev/guide/routing/route-guards |
| Angular HttpInterceptorFn | https://angular.dev/api/common/http/HttpInterceptorFn |
| Angular APP_INITIALIZER | https://angular.dev/api/core/APP_INITIALIZER |
| Angular Signals | https://angular.dev/guide/signals |
| Angular OnPush + Signals | https://angular.dev/best-practices/skipping-subtrees |
| Angular SSR / DOCUMENT | https://angular.dev/guide/ssr |
| Angular Style Guide | https://angular.dev/style-guide |
| Taiga UI Components | https://taiga-ui.dev |
| Transloco | https://jsverse.github.io/transloco |
| WCAG 3.1.1 Language of page | https://www.w3.org/WAI/WCAG21/Understanding/language-of-page |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 4.5/10 | 6 | 8 | 9 |
| 2026-03-09 | 4.5/10 | 6 | 8 | 8 |
| 2026-03-16 | 5.5/10 | 2 | 7 | 7 |
