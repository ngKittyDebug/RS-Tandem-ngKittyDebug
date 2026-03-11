# Frontend Code Review — MeowVault

## Дата ревью: 2026-03-09

## Общая оценка: 4.5/10

Состояние кода по сравнению с предыдущим ревью практически не изменилось. Ни одно из замечаний CRITICAL или MAJOR уровня не было исправлено. Auth Guard отсутствует, HTTP Interceptor не создан, refresh при загрузке не вызывается, `ThemeService` по-прежнему обращается к `localStorage` напрямую, `provideTranslocoPersistLang` использует `useValue: localStorage`, опечатки в именах классов сохранились, `ChangeDetectionStrategy.OnPush` отсутствует в большинстве компонентов, тесты остались smoke-тестами. Единственное позитивное изменение — в тест-сьютах `ThemeSwitcher` и `LaguageSwitcher` добавлены реальные тесты функциональности.

> **Источники best practices:** [Angular v20+ Docs](https://v20.angular.dev), Angular Signals Skill, Angular Component Skill, [Taiga UI](https://taiga-ui.dev)

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
| ---------------------------------------- | ------ | ---------------------- | --- |
| 1. Архитектура и структура проекта | 4/10 | Критические проблемы | = |
| 2. Компоненты и Angular-паттерны | 5/10 | Существенные замечания | = |
| 3. Управление состоянием (Signals, RxJS) | 5/10 | Существенные замечания | = |
| 4. Формы и валидация | 6/10 | Есть замечания | = |
| 5. Безопасность (фронтенд) | 2/10 | Критические проблемы | = |
| 6. i18n и локализация | 6/10 | Есть замечания | = |
| 7. Стили и UI/UX | 5/10 | Существенные замечания | = |
| 8. Тестирование | 3/10 | Критические проблемы | ↑ |
| 9. Конфигурация и сборка | 5/10 | Существенные замечания | = |

---

## 1. Архитектура и структура проекта (4/10)

Структура каталогов правильная: `core/` для сервисов, layout, компонентов; `pages/` для маршрутов. Lazy loading настроен для всех роутов. Однако критически отсутствуют ключевые архитектурные элементы auth-flow.

### `[CRITICAL]` Отсутствует Auth Guard — `/user-profile` доступен без аутентификации

**Файл:** `src/app/app.routes.ts:31-35`

> Из [Angular v20 Docs — Route Guards](https://v20.angular.dev/guide/routing/route-guards): Functional guards с `CanActivateFn` — рекомендуемый подход в Angular 20+.

Статус: **Не исправлено.** `AuthService.isLoggedIn` — computed signal, доступный для использования в guard, но guard так и не создан.

```ts
{
  path: AppRoute.USER_PROFILE,
  loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
  providers: [provideTranslocoScope('user-profile')],
  // ← нет canActivate!
},
```

**Исправление:** Создать `core/guards/auth.guard.ts`:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
```

Добавить `canActivate: [authGuard]` к роуту `user-profile`.

---

### `[CRITICAL]` Отсутствует HTTP Interceptor — access token никогда не отправляется в API

**Файл:** `src/app/app.config.ts:18`

> Из [Angular v20 Docs — HttpInterceptorFn](https://v20.angular.dev/api/common/http/HttpInterceptorFn): Functional interceptors регистрируются через `provideHttpClient(withInterceptors([...]))`.

Статус: **Не исправлено.** `provideHttpClient()` вызывается без `withInterceptors`. Любой защищённый API-запрос уйдёт без `Authorization: Bearer`.

```ts
// app.config.ts:18
provideHttpClient(), // ← нет withInterceptors
```

**Исправление:** Создать `core/interceptors/auth.interceptor.ts`:

```ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();
  if (!token) return next(req);
  return next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }));
};
```

Зарегистрировать: `provideHttpClient(withInterceptors([authInterceptor]))`

---

### `[CRITICAL]` Нет token refresh при загрузке страницы — auth теряется при F5

**Файл:** `src/app/core/services/auth/auth-service.ts:13`

Статус: **Не исправлено.** `accessToken` — in-memory signal, инициализирован `null`. При перезагрузке страницы пользователь немедленно становится "не залогиненным", несмотря на httpOnly cookie с refresh token.

```ts
private accessToken = signal<string | null>(null); // всегда null после F5
```

**Исправление:** Вызывать `auth.refresh()` в `APP_INITIALIZER` в `app.config.ts`:

```ts
{
  provide: APP_INITIALIZER,
  useFactory: () => {
    const auth = inject(AuthService);
    return () => auth.refresh().pipe(catchError(() => of(void 0)));
  },
  multi: true,
}
```

---

### `[MAJOR]` 4 из 5 страниц — пустые заглушки

**Файлы:** `pages/registration/registration.html`, `pages/main/main.html`, `pages/user-profile/user-profile.html`, `pages/not-found/not-found.html`

Статус: **Не исправлено.** Все четыре страницы рендерят один `<p>` с debug-текстом. Registration не имеет формы регистрации.

---

## 2. Компоненты и Angular-паттерны (5/10)

> **Angular Component Skill:** В Angular v20+ `standalone: true` не нужно указывать. Обязательно: `ChangeDetectionStrategy.OnPush`.

### `[MAJOR]` Опечатка в имени класса: `LaguageSwitcher` (пропущена буква `n`)

**Файлы:**
- `core/components/language-switcher/language-switcher.ts:15`
- `core/layout/header/header.ts:6` (импорт)
- `core/components/language-switcher/language-switcher.spec.ts:4,6,8,30,43`

Статус: **Не исправлено.**

```ts
export class LaguageSwitcher implements OnInit { // должно быть LanguageSwitcher
```

---

### `[MAJOR]` Опечатка в имени сервиса: `AppTosterService` (должно быть `Toaster`)

**Файлы:**
- `core/services/app-toster-service.ts:21`
- `pages/login/login.ts:27,57`
- `core/services/app-toster-service.spec.ts`

Статус: **Не исправлено.**

```ts
export class AppTosterService { // должно быть AppToasterService
```

**Исправление:** Переименовать файл, класс и enum'ы `TosterLabels`/`TosterAppearances`.

---

### `[MAJOR]` Большинство компонентов не используют `ChangeDetectionStrategy.OnPush`

**Файлы:** `pages/login/login.ts`, `pages/registration/registration.ts`, `pages/main/main.ts`, `pages/user-profile/user-profile.ts`, `pages/not-found/not-found.ts`, `core/layout/header/header.ts`, `core/layout/footer/footer.ts`, `app.ts`, `pages/login/components/img-cat/img-cat.ts`

Статус: **Не исправлено ни в одном компоненте.** `ThemeSwitcher` и `LaguageSwitcher` — правильно. Остальные 9 компонентов — нет.

> **Angular Component Skill (ОБЯЗАТЕЛЬНО):** `ChangeDetectionStrategy.OnPush` — стандарт при использовании signals в Angular 20+.

**Исправление:** Добавить во все компоненты:
```ts
@Component({ changeDetection: ChangeDetectionStrategy.OnPush, ... })
```

---

### `[MINOR]` `App` компонент содержит неиспользуемый signal `title`

**Файл:** `src/app/app.ts:15`

Статус: **Не исправлено.** `protected readonly title = signal('frontend')` нигде не используется.

---

### `[SUGGESTION]` `standalone: true` избыточно в Angular 21

`LaguageSwitcher` и `ThemeSwitcher` явно указывают `standalone: true` — в Angular 21 это дефолтное значение.

---

## 3. Управление состоянием (Signals, RxJS) (5/10)

### `[MAJOR]` `LaguageSwitcher` использует мутабельные свойства вместо signals

**Файл:** `core/components/language-switcher/language-switcher.ts:18-20,22-30`

Статус: **Не исправлено.**

```ts
public currentLang: string | null = null;  // мутабельное свойство
public languages: string[] = [];            // мутабельное свойство
protected value: string | null = null;      // мутабельное свойство
```

`currentLang` и `value` частично дублируют состояние.

**Исправление (Angular Signals Skill):**
```ts
protected readonly value = signal(this.translocoService.getActiveLang());
protected readonly languages = signal(
  this.translocoService.getAvailableLangs()
    .map(lang => typeof lang === 'string' ? lang : lang.id)
);
// Удалить currentLang, OnInit, ngOnInit
```

---

### `[MINOR]` `AppTosterService` — подписки на Observable не отписываются

**Файл:** `core/services/app-toster-service.ts:31,40,50`

Статус: **Не исправлено.**

```ts
this.alerts.open(message, { ... }).subscribe(); // нет takeUntilDestroyed
```

---

### `[SUGGESTION]` `AuthService` — рекомендуется `asReadonly()` для публичных signals

> **Angular Signals Skill — Service State Pattern:** Приватный writable signal + публичный readonly.

```ts
// Рекомендуемый паттерн:
private _accessToken = signal<string | null>(null);
readonly accessToken = this._accessToken.asReadonly();
readonly isLoggedIn = computed(() => this._accessToken() !== null);
```

---

## 4. Формы и валидация (6/10)

Страница логина реализована качественно: Reactive Forms, переключение режимов email/username, динамическая смена валидаторов, `finalize` для loading state, `takeUntilDestroyed` для cleanup.

### `[MAJOR]` Login проверяет HTTP 403 вместо 401 для невалидных credentials

**Файл:** `src/app/pages/login/login.ts:118-119`

Статус: **Не исправлено.**

```ts
const key = error.status === 403 ? 'login.error.invalidCredentials' : 'login.error.serverError';
```

Когда backend будет исправлен на 401, фронтенд сломается.

**Исправление:** Изменить на `401` (синхронно с исправлением backend).

---

### `[MINOR]` `getInputError` вызывается в шаблоне на каждый цикл change detection

**Файл:** `src/app/pages/login/login.ts:127-140`, `login.html:49,62,77`

```html
<tui-error [error]="getInputError('email')"></tui-error>
```

Метод с `translocoService.translate()` внутри вызывается при каждом change detection.

**Исправление:** Заменить на `computed()` signals.

---

### `[SUGGESTION]` Возвращаемый тип `getRoutePath` неточен

**Файл:** `src/app/app.routes.ts:11`

```ts
export const getRoutePath = (route: AppRoute): `/${AppRoute}` => {
```

Тип — юнион всех enum-значений с `/` prefix, а не конкретного переданного.

---

## 5. Безопасность (фронтенд) (2/10)

### `[CRITICAL]` Access token хранится только in-memory — нет persistent auth

**Файл:** `src/app/core/services/auth/auth-service.ts:13`

Статус: **Не исправлено.** При F5 пользователь теряет аутентификацию. Auth-flow практически нерабочий в реальном использовании.

---

### `[CRITICAL]` `ThemeService` обращается к `localStorage` при конструировании — SSR crash

**Файл:** `src/app/core/services/theme-service.ts:9`

Статус: **Не исправлено.**

```ts
private baseTheme = localStorage.getItem(STORAGE_KEYS.THEME) || ThemeNames.Light;
```

В SSR или Web Worker: `ReferenceError: localStorage is not defined`.

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

### `[CRITICAL]` `provideTranslocoPersistLang` ссылается на `localStorage` при инициализации

**Файл:** `src/app/app.config.ts:28-32`

Статус: **Не исправлено.**

```ts
provideTranslocoPersistLang({
  storage: { useValue: localStorage }, // ← SSR crash
}),
```

**Исправление:** `storage: { useFactory: () => localStorage }`

---

## 6. i18n и локализация (6/10)

Transloco настроен правильно: 2 языка (ru/en), scoped translations, persist lang.

### `[MINOR]` Hardcoded `'...'` вместо translated loading text

**Файл:** `src/app/pages/login/login.html:87`

Статус: **Не исправлено.**

```html
{{ isLoading() ? '...' : t('login.buttons.login') }}
```

---

### `[MINOR]` `index.html` — `lang="en"` при дефолтном языке `ru`

**Файл:** `src/index.html:2`

Статус: **Не исправлено.** Проблема accessibility (WCAG AA).

---

### `[MINOR]` `<title>Frontend</title>` вместо `MeowVault`

**Файл:** `src/index.html:5`

Статус: **Не исправлено.**

---

### `[SUGGESTION]` Placeholder-переводы в файлах заглушек

**Файлы:** `public/i18n/main/*.json`, `public/i18n/not-found/*.json`, `public/i18n/registration/*.json`, `public/i18n/user-profile/*.json`

Содержат только debug-ключи вроде `"mainWorks": "Main page works"`.

---

### `[SUGGESTION]` Неиспользуемые translation keys

**Файл:** `public/i18n/login/en.json`, `public/i18n/login/ru.json`

Ключи `buttons.google` и `divider` не используются в шаблоне.

---

## 7. Стили и UI/UX (5/10)

### `[MAJOR]` `ThemeSwitcher` — checkbox не привязан к текущей теме

**Файл:** `core/components/theme-switcher/theme-switcher.html:1-9`

Статус: **Не исправлено.** После перезагрузки тема восстанавливается из localStorage, но checkbox всегда начинает в unchecked состоянии.

```html
<input tuiLike type="checkbox" (change)="onChangeTheme()" ... />
```

**Исправление:** Добавить `[checked]="themeService.theme() === ThemeNames.Dark"`.

---

### `[MINOR]` Header grid layout — лого занимает 50% ширины

**Файл:** `core/layout/header/header.scss:7`

Статус: **Не исправлено.**

```scss
grid-template-columns: 1fr 1fr; // лого растягивается на половину header
```

**Исправление:** `grid-template-columns: auto 1fr;`

---

## 8. Тестирование (3/10)

Незначительное улучшение: `ThemeSwitcher.spec.ts` и `LaguageSwitcher.spec.ts` получили поведенческие тесты. Все остальные spec-файлы остались smoke-тестами.

### `[RESOLVED]` `ThemeSwitcher.spec.ts` — добавлен тест `onChangeTheme()`

**Файл:** `core/components/theme-switcher/theme-switcher.spec.ts:28-31`

Добавлен тест с mock `ThemeService`, проверяющий вызов `changeTheme()`. Хороший паттерн с spy-объектом.

---

### `[RESOLVED]` `LaguageSwitcher.spec.ts` — добавлен тест переключения языка

**Файл:** `core/components/language-switcher/language-switcher.spec.ts:39-44`

Добавлен тест с mock `TranslocoService`, проверяющий `setActiveLang()` и обновление `currentLang`.

---

### `[CRITICAL]` Ключевые тесты по-прежнему отсутствуют

**Файлы:** `auth-service.spec.ts`, `theme-service.spec.ts`, `login.spec.ts`, `main.spec.ts`, `registration.spec.ts`, `user-profile.spec.ts`, `not-found.spec.ts`, `header.spec.ts`, `footer.spec.ts`, `img-cat.spec.ts`

Статус: **Не исправлено.** Все spec-файлы содержат только `"should be created"`. Нет тестов для `AuthService.login()`, `.logout()`, `.refresh()`, `isLoggedIn`; `ThemeService.changeTheme()` и localStorage; `Login` form validation, mode switching, submit, error handling.

**Пример теста для `AuthService`:**
```ts
describe('AuthService', () => {
  it('should set isLoggedIn to true after login', fakeAsync(() => {
    const http = TestBed.inject(HttpTestingController);
    authService.login({ email: 'a@b.com', password: 'Pass1234' }).subscribe();
    http.expectOne('/auth/login').flush({ accessToken: 'test-token' });
    expect(authService.isLoggedIn()).toBe(true);
  }));
});
```

---

### `[MINOR]` `app.spec.ts` — перманентно пропущенный тест с неверным assertion

**Файл:** `src/app/app.spec.ts:30-35`

Статус: **Не исправлено.**

```ts
it.skip('should render title', async () => {
  expect(compiled.querySelector('p')?.textContent).toContain('main works!');
```

---

### `[MINOR]` `ThemeSwitcher.spec.ts` — опечатка в `describe` блоке

**Файл:** `core/components/theme-switcher/theme-switcher.spec.ts:6`

Статус: **Новое.**

```ts
describe('ThemeSwither', () => { // ← пропущена буква 'c'
```

**Исправление:** `'ThemeSwitcher'`

---

## 9. Конфигурация и сборка (5/10)

### `[MAJOR]` `validate-branch-name` — production dependency вместо dev

**Файл:** `package.json:51`

Статус: **Не исправлено.** Git hooks инструмент в `dependencies` — попадёт в production bundle.

**Исправление:** Перенести в `devDependencies`.

---

### `[MAJOR]` `dotenv` — неиспользуемый production dependency

**Файл:** `package.json:48`

Статус: **Не исправлено.** `dotenv` не импортируется нигде в frontend коде. Angular CLI обрабатывает env-переменные самостоятельно.

**Исправление:** Удалить или перенести в `devDependencies`.

---

### `[MINOR]` ESLint ignores `**/*.js` — конфиг ESLint не линтит себя

**Файл:** `eslint.config.cjs:10`

Статус: **Не исправлено.** `**/*.js` исключает сам конфиг ESLint.

---

### `[SUGGESTION]` `@angular/cdk` указан и в `dependencies`, и в `devDependencies`

**Файл:** `package.json:34,59`

Статус: **Не исправлено.**

```json
"dependencies":    { "@angular/cdk": "~21.1.5" },
"devDependencies": { "@angular/cdk": "^21.1.5" }
```

**Исправление:** Оставить только в `dependencies`.

---

## 10. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)

- [ ] Создать `AuthGuard` (functional `CanActivateFn`) и защитить роут `/user-profile`
- [ ] Создать `AuthInterceptor` (`HttpInterceptorFn`) для отправки access token
- [ ] Реализовать auto-refresh token при загрузке через `APP_INITIALIZER`
- [ ] Исправить `ThemeService` — SSR-safe через `inject(DOCUMENT)`
- [ ] Исправить `provideTranslocoPersistLang` — `useFactory` вместо `useValue`
- [ ] Написать реальные тесты для `AuthService`, `ThemeService`, `Login`

### Приоритет 2 (важно)

- [ ] Исправить опечатку `LaguageSwitcher` → `LanguageSwitcher`
- [ ] Исправить опечатку `AppTosterService` → `AppToasterService`
- [ ] Добавить `ChangeDetectionStrategy.OnPush` ко **всем** компонентам
- [ ] Реализовать страницу Registration (форма регистрации)
- [ ] Привязать `checked` checkbox к текущей теме в `ThemeSwitcher`
- [ ] Изменить проверку `error.status === 403` → `401` в login (синхронно с backend)
- [ ] Перенести `validate-branch-name` и `dotenv` из `dependencies`
- [ ] Перевести `LaguageSwitcher` на signals
- [ ] Использовать `asReadonly()` для публичных signals в сервисах

### Приоритет 3 (желательно)

- [ ] Удалить мёртвый `title` signal в `App`
- [ ] Удалить избыточный `standalone: true` (Angular 21 default)
- [ ] Исправить `<html lang="en">` → `lang="ru"` в `index.html`
- [ ] Исправить `<title>Frontend</title>` → `MeowVault`
- [ ] Исправить `grid-template-columns: 1fr 1fr` в `header.scss`
- [ ] Заменить `getInputError` method binding на `computed()` signals
- [ ] Реализовать страницу NotFound с полноценным дизайном
- [ ] Удалить или обновить skipped тест в `app.spec.ts`
- [ ] Исправить опечатку `'ThemeSwither'` в `theme-switcher.spec.ts`
- [ ] Убрать дубликат `@angular/cdk` из `devDependencies`

---

## Ссылки на документацию

| Тема | Ссылка |
| -------------------------------- | ---------------------------------------------------------------------- |
| Angular v20 Route Guards | https://v20.angular.dev/guide/routing/route-guards |
| Angular HttpInterceptorFn | https://v20.angular.dev/api/common/http/HttpInterceptorFn |
| Angular withInterceptors | https://v20.angular.dev/api/common/http/withInterceptors |
| Angular Signals Tutorial | https://v20.angular.dev/tutorials/signals |
| Angular OnPush + Signals | https://v20.angular.dev/tutorials/signals/1-creating-your-first-signal |
| Angular Component Best Practices | https://v20.angular.dev/style-guide |
| Angular SSR / DOCUMENT | https://v20.angular.dev/guide/ssr |
| Taiga UI Components | https://taiga-ui.dev |
| Transloco | https://jsverse.github.io/transloco |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
| ---------- | ------------ | ----------- | -------- | -------- |
| 2026-03-09 | 4.5/10 | 6 | 8 | 9 |
| 2026-03-09 | 4.5/10 | 6 | 8 | 8 |
