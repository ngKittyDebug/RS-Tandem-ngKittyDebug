# Frontend Code Review — MeowVault

## Дата ревью: 2026-03-09

## Общая оценка: 4.5/10

Проект построен на Angular 21 с Taiga UI, Transloco для i18n и signal-based подходом — технологический стек выбран грамотно. Реализована страница логина с переключением режимов (email/username), система тем, переключатель языков. Однако auth-flow на фронтенде критически неполон: нет guard, нет interceptor, нет refresh при загрузке страницы. Большинство страниц — пустые заглушки.

> **Источники best practices:** [Angular v20+ Docs](https://v20.angular.dev), Angular Signals Skill, Angular Component Skill, [Taiga UI](https://taiga-ui.dev)

## Сводная таблица оценок

| Категория                                | Оценка | Статус                 |
| ---------------------------------------- | ------ | ---------------------- |
| 1. Архитектура и структура проекта       | 4/10   | Критические проблемы   |
| 2. Компоненты и Angular-паттерны         | 5/10   | Существенные замечания |
| 3. Управление состоянием (Signals, RxJS) | 5/10   | Существенные замечания |
| 4. Формы и валидация                     | 6/10   | Есть замечания         |
| 5. Безопасность (фронтенд)               | 2/10   | Критические проблемы   |
| 6. i18n и локализация                    | 6/10   | Есть замечания         |
| 7. Стили и UI/UX                         | 5/10   | Существенные замечания |
| 8. Тестирование                          | 2/10   | Критические проблемы   |
| 9. Конфигурация и сборка                 | 5/10   | Существенные замечания |

---

## 1. Архитектура и структура проекта (4/10)

Структура каталогов правильная: `core/` для сервисов, layout, компонентов; `pages/` для маршрутов; `shared/` для общих сущностей. Lazy loading настроен для всех роутов. Однако критически отсутствуют ключевые архитектурные элементы.

### `[CRITICAL]` Отсутствует Auth Guard — `/user-profile` доступен без аутентификации

**Файл:** `src/app/app.routes.ts:31-35`

> Из [Angular v20 Docs — Route Guards](https://v20.angular.dev/guide/routing/route-guards): Functional guards с `CanActivateFn` — рекомендуемый подход в Angular 20+. Class-based guards устарели.

```ts
{
  path: AppRoute.USER_PROFILE,
  loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
  providers: [provideTranslocoScope('user-profile')],
  // ← нет canActivate!
},
```

Любой пользователь может перейти на `/user-profile` без аутентификации. `AuthService.isLoggedIn` — computed signal, который уже доступен, но никакой guard его не использует.

**Исправление (Angular v20+ functional guard):** Создать `core/guards/auth.guard.ts`:

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

### `[CRITICAL]` Отсутствует HTTP Interceptor — access token никогда не отправляется в API

**Файл:** `src/app/core/services/auth/auth-service.ts` (весь файл), `src/app/app.config.ts:18`

> Из [Angular v20 Docs — HttpInterceptorFn](https://v20.angular.dev/api/common/http/HttpInterceptorFn): Functional interceptors (`HttpInterceptorFn`) — рекомендуемый подход. Регистрируются через `provideHttpClient(withInterceptors([...]))`.

`AuthService` хранит `accessToken` в signal (строка 13), но в проекте нет ни одного HTTP interceptor. `provideHttpClient()` (app.config.ts:18) вызывается без `withInterceptors(...)`. Любой защищённый API-запрос придёт без заголовка `Authorization: Bearer`.

```ts
// app.config.ts:18 — нет interceptors
provideHttpClient(),
```

**Исправление (из Angular v20 docs — `HttpInterceptorFn`):** Создать `core/interceptors/auth.interceptor.ts`:

```ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();
  if (!token) return next(req);
  return next(
    req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    }),
  );
};
```

Зарегистрировать в `app.config.ts`:

```ts
import { withInterceptors } from '@angular/common/http';
provideHttpClient(withInterceptors([authInterceptor]));
```

### `[CRITICAL]` Нет token refresh при загрузке страницы — auth теряется при F5

**Файл:** `src/app/core/services/auth/auth-service.ts:13`

```ts
private accessToken = signal<string | null>(null);
```

`accessToken` — in-memory signal, инициализирован `null`. При каждой перезагрузке страницы пользователь мгновенно становится "не залогиненным", хотя httpOnly cookie с refresh token остаётся в браузере. Backend предоставляет `POST /auth/refresh`, но он нигде не вызывается при init.

**Исправление:** Вызывать `authService.refresh()` в `APP_INITIALIZER` или в конструкторе корневого компонента:

```ts
// app.config.ts
import { APP_INITIALIZER, inject } from '@angular/core';
import { catchError, of } from 'rxjs';

{
  provide: APP_INITIALIZER,
  useFactory: () => {
    const auth = inject(AuthService);
    return () => auth.refresh().pipe(catchError(() => of(void 0)));
  },
  multi: true,
}
```

### `[MAJOR]` 4 из 5 страниц — пустые заглушки

**Файлы:** `pages/registration/registration.html`, `pages/main/main.html`, `pages/user-profile/user-profile.html`, `pages/not-found/not-found.html`

Все четыре страницы рендерят единственный `<p>` с placeholder-текстом. Страница Registration не имеет формы, хотя login-страница ссылается на неё. Пользователь, кликнувший "Sign up", попадёт на пустую страницу.

---

## 2. Компоненты и Angular-паттерны (5/10)

> **Angular Component Skill:** В Angular v20+ компоненты standalone по умолчанию — не нужно указывать `standalone: true`. Обязательно: `ChangeDetectionStrategy.OnPush`, signal-based inputs/outputs, `host` object вместо `@HostBinding/@HostListener`.

### `[MAJOR]` Опечатка в имени класса: `LaguageSwitcher` (пропущена буква `n`)

**Файлы:**

- `core/components/language-switcher/language-switcher.ts:15`
- `core/layout/header/header.ts:6` (импорт)
- `core/components/language-switcher/language-switcher.spec.ts:4,6,8,18,30`

```ts
// language-switcher.ts:15
export class LaguageSwitcher implements OnInit {
```

Опечатка `Laguage` вместо `Language` присутствует во всех импортах и тестах.

**Исправление:** Переименовать класс в `LanguageSwitcher` и обновить все импорты.

### `[MAJOR]` Опечатка в имени сервиса: `AppTosterService` (должно быть `Toaster`)

**Файлы:**

- `core/services/app-toster-service.ts:21`
- `pages/login/login.ts:27,57`
- `core/services/app-toster-service.spec.ts`

```ts
// app-toster-service.ts:21
export class AppTosterService {
```

`Toster` вместо `Toaster` — последовательная опечатка во всех файлах и импортах.

**Исправление:** Переименовать файл в `app-toaster-service.ts`, класс в `AppToasterService`.

### `[MAJOR]` Все page-компоненты не используют `ChangeDetectionStrategy.OnPush`

**Файлы:** `pages/login/login.ts`, `pages/registration/registration.ts`, `pages/main/main.ts`, `pages/user-profile/user-profile.ts`, `pages/not-found/not-found.ts`, `core/layout/header/header.ts`, `core/layout/footer/footer.ts`, `app.ts`, `pages/login/components/img-cat/img-cat.ts`

> **Angular Component Skill (ОБЯЗАТЕЛЬНО):** Каждый компонент должен объявлять `changeDetection: ChangeDetectionStrategy.OnPush`. Это стандарт Angular v20+ и обязательное требование при использовании signals.
>
> Из [Angular v20 Docs](https://v20.angular.dev/tutorials/signals/1-creating-your-first-signal): _"ChangeDetectionStrategy.OnPush is a performance optimization for components, especially those using signals."_

`ThemeSwitcher` и `LaguageSwitcher` правильно объявляют `ChangeDetectionStrategy.OnPush`. Все остальные компоненты (9 штук) используют дефолтный `CheckAlways`.

**Исправление:** Добавить `changeDetection: ChangeDetectionStrategy.OnPush` во все компоненты:

```ts
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

### `[MINOR]` `App` компонент содержит неиспользуемый signal `title`

**Файл:** `src/app/app.ts:16`

```ts
protected readonly title = signal('frontend');
```

`title` нигде не используется в шаблоне. Мёртвый код.

### `[SUGGESTION]` Компоненты явно указывают `standalone: true`, что избыточно в Angular 21

> **Angular Component Skill:** В Angular v20+ компоненты standalone по умолчанию — `standalone: true` не нужно указывать.

`LaguageSwitcher` (строка 9) и `ThemeSwitcher` явно указывают `standalone: true`. В Angular 21 это дефолтное значение и может быть удалено.

---

## 3. Управление состоянием (Signals, RxJS) (5/10)

> **Angular Signals Skill:** Signals — реактивный примитив Angular для управления состоянием. `signal()` для writable state, `computed()` для derived state, `effect()` для side effects.

### `[MAJOR]` `LaguageSwitcher` использует мутабельные свойства вместо signals

**Файл:** `core/components/language-switcher/language-switcher.ts:18-20,22-30`

```ts
public currentLang: string | null = null;  // мутабельное свойство
public languages: string[] = [];            // мутабельное свойство
protected value: string | null = null;      // мутабельное свойство
```

Компонент реализует `OnInit` для инициализации данных и использует три мутабельных свойства вместо signals. В Angular 21 codebase, где все остальные сервисы используют signals, это inconsistent. Кроме того, `currentLang` и `value` частично дублируют состояние.

**Исправление (по Angular Signals Skill):**

```ts
// Используем signal() для writable state
protected readonly value = signal(this.translocoService.getActiveLang());
protected readonly languages = signal(
  this.translocoService.getAvailableLangs()
    .map(lang => typeof lang === 'string' ? lang : lang.id)
);
// Удалить currentLang, OnInit, ngOnInit
```

### `[SUGGESTION]` `AuthService` — рекомендуется использовать `asReadonly()` для публичных signals

> **Angular Signals Skill — Service State Pattern:** Приватный writable signal + публичный readonly signal.

```ts
// Текущая реализация:
private accessToken = signal<string | null>(null);
public isLoggedIn = computed(() => this.accessToken() !== null);

// Рекомендуемый паттерн (Angular Signals Skill):
private _accessToken = signal<string | null>(null);
readonly accessToken = this._accessToken.asReadonly();
readonly isLoggedIn = computed(() => this._accessToken() !== null);
```

Это предотвращает случайное изменение состояния извне сервиса.

### `[MINOR]` `AppTosterService` — подписки на Observable не отписываются

**Файл:** `core/services/app-toster-service.ts:29,40,50`

```ts
this.alerts.open(message, { ... }).subscribe();
```

`.subscribe()` без хранения Subscription или `takeUntilDestroyed`. Для root-level сервиса с `autoClose` это минорная проблема, но нарушает Angular best practices.

---

## 4. Формы и валидация (6/10)

Страница логина реализована качественно: Reactive Forms, переключение режимов email/username, динамическая смена валидаторов, `finalize` для loading state, `takeUntilDestroyed` для cleanup.

### `[MAJOR]` Login проверяет HTTP 403 вместо 401 для невалидных credentials

**Файл:** `src/app/pages/login/login.ts:118-119`

```ts
const key = error.status === 403 ? 'login.error.invalidCredentials' : 'login.error.serverError';
```

Backend возвращает `ForbiddenException` (403) для неверных учётных данных — это ошибка backend (см. backend review). Фронтенд зеркально проверяет 403. Когда backend будет исправлен на 401, фронтенд сломается.

**Исправление:** Изменить на `401` (синхронно с исправлением backend):

```ts
const key = error.status === 401 ? 'login.error.invalidCredentials' : 'login.error.serverError';
```

### `[MINOR]` `getInputError` вызывается в шаблоне на каждый цикл change detection

**Файл:** `src/app/pages/login/login.ts:127-140`, `login.html:49,62,77`

> **Angular Signals Skill:** Используйте `computed()` для derived state вместо method calls в template bindings.

```html
<tui-error [error]="getInputError('email')"></tui-error>
```

Метод в binding expression вызывается при каждом change detection. С `CheckAlways` и `translocoService.translate()` внутри — это лишние вычисления.

**Исправление (по Angular Signals Skill):**

```ts
// Заменить метод на computed signals:
protected readonly emailError = computed(() => {
  const control = this.loginForm.controls.email;
  if (!control.touched) return null;
  if (control.hasError('required')) return this.translocoService.translate('login.error.required');
  if (control.hasError('pattern')) return this.translocoService.translate('login.error.emailPattern');
  return null;
});
```

### `[SUGGESTION]` Возвращаемый тип `getRoutePath` неточен

**Файл:** `src/app/app.routes.ts:11`

```ts
export const getRoutePath = (route: AppRoute): `/${AppRoute}` => {
```

Тип `` `/${AppRoute}` `` — это юнион всех enum-значений с `/` prefix. Более точный тип: `` `/${typeof route}` ``.

---

## 5. Безопасность (фронтенд) (2/10)

### `[CRITICAL]` Access token хранится только in-memory — нет persistent auth

**Файл:** `src/app/core/services/auth/auth-service.ts:13`

При F5 (перезагрузке) пользователь теряет аутентификацию. Нет автоматического refresh при старте приложения (см. раздел 1.3). Это делает auth-flow практически нерабочим в реальном использовании.

### `[CRITICAL]` `ThemeService` обращается к `localStorage` при конструировании — SSR crash

**Файл:** `src/app/core/services/theme-service.ts:9`

> **Angular Component Skill:** Для DOM-зависимого кода используйте `afterNextRender()` или `inject(DOCUMENT)` для SSR-совместимости. Прямой доступ к `localStorage`, `window`, `document` вне injection context — антипаттерн.

```ts
private baseTheme = localStorage.getItem(STORAGE_KEYS.THEME) || ThemeNames.Light;
```

`localStorage` вызывается как field initializer, вне Angular injection context. В SSR или Web Worker этот код упадёт с `ReferenceError: localStorage is not defined`.

**Исправление (SSR-safe, по Angular Component Skill):**

```ts
import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  public readonly theme: WritableSignal<string>;

  constructor() {
    const stored = this.doc.defaultView?.localStorage.getItem(STORAGE_KEYS.THEME);
    this.theme = signal(stored ?? ThemeNames.Light);
  }

  public changeTheme(): void {
    this.theme.update((t) => (t === ThemeNames.Light ? ThemeNames.Dark : ThemeNames.Light));
    this.doc.defaultView?.localStorage.setItem(STORAGE_KEYS.THEME, this.theme());
  }
}
```

### `[CRITICAL]` `provideTranslocoPersistLang` ссылается на `localStorage` при инициализации

**Файл:** `src/app/app.config.ts:28-32`

```ts
provideTranslocoPersistLang({
  storage: { useValue: localStorage },
}),
```

`localStorage` используется на этапе конфигурации. Аналогично ThemeService — упадёт в SSR.

**Исправление:** `storage: { useFactory: () => localStorage }`

---

## 6. i18n и локализация (6/10)

Transloco настроен правильно: 2 языка (ru/en), scoped translations для каждого роута, persist lang через localStorage. Файлы переводов структурированы по папкам.

### `[MINOR]` Hardcoded `'...'` вместо translated loading text

**Файл:** `src/app/pages/login/login.html:87`

```html
{{ isLoading() ? '...' : t('login.buttons.login') }}
```

Loading state показывает хардкоженную строку вместо перевода или спиннера `<tui-loader>`.

### `[MINOR]` `index.html` — `lang="en"` при дефолтном языке `ru`

**Файл:** `src/index.html:3`

> Для accessibility (WCAG AA) атрибут `lang` должен соответствовать реальному языку контента.

```html
<html lang="en"></html>
```

Дефолтный язык в Transloco — `ru`, но `<html lang>` захардкожен как `en`. Проблема accessibility.

### `[MINOR]` `<title>Frontend</title>` вместо `MeowVault`

**Файл:** `src/index.html:5`

### `[SUGGESTION]` Placeholder переводы в файлах заглушек

**Файлы:** `public/i18n/main/*.json`, `public/i18n/not-found/*.json`, `public/i18n/registration/*.json`, `public/i18n/user-profile/*.json`

Все содержат только debug-ключи вроде `"mainWorks": "Main page works"`.

### `[SUGGESTION]` Неиспользуемые translation keys

**Файл:** `public/i18n/login/en.json`

Ключи `buttons.google` и `divider` не используются в шаблоне — остатки запланированного "Continue with Google".

---

## 7. Стили и UI/UX (5/10)

### `[MAJOR]` `ThemeSwitcher` — checkbox не привязан к текущей теме

**Файл:** `core/components/theme-switcher/theme-switcher.html`

> **Angular Component Skill:** Используйте host bindings или template bindings для синхронизации UI с состоянием signals.

```html
<input tuiLike type="checkbox" (change)="onChangeTheme()" ... />
```

`checked` state не привязан к `themeService.theme()`. После перезагрузки страницы тема восстанавливается из localStorage, но checkbox всегда начинает unchecked.

**Исправление:** Добавить `[checked]="themeService.theme() === ThemeNames.Dark"`

### `[MINOR]` Header grid layout — лого занимает 50% ширины

**Файл:** `core/layout/header/header.scss:8`

```scss
grid-template-columns: 1fr 1fr;
```

Лого растягивается на половину header вместо natural width.

**Исправление:** `grid-template-columns: auto 1fr;`

---

## 8. Тестирование (2/10)

### `[CRITICAL]` Все тесты — smoke-тесты "should create"

**Файлы:** все `*.spec.ts` (кроме `app-toster-service.spec.ts`)

Каждый spec-файл содержит 1-2 теста: только `"should be created"`. Нет тестов для:

- `AuthService.login()`, `.logout()`, `.refresh()`, `.isLoggedIn` computed signal
- `ThemeService.changeTheme()` и localStorage persistence
- `Login` form validation, mode switching, submit, error handling
- `LaguageSwitcher` ngOnInit, language switching

`AppTosterService` spec — единственный файл с содержательными тестами. Его уровень должен быть эталоном для остальных.

**Пример теста для AuthService (по Angular Signals Skill):**

```ts
describe('AuthService', () => {
  it('should set isLoggedIn to true after login', () => {
    // arrange: mock HttpClient to return { accessToken: 'test' }
    // act: call authService.login(...)
    // assert: expect(authService.isLoggedIn()).toBe(true)
  });

  it('should clear token on logout', () => {
    // act: call authService.logout()
    // assert: expect(authService.isLoggedIn()).toBe(false)
  });
});
```

### `[MINOR]` `app.spec.ts` — пропущенный тест с неверным assertion

**Файл:** `src/app/app.spec.ts`

```ts
it.skip('should render title', async () => {
  expect(compiled.querySelector('p')?.textContent).toContain('main works!');
```

Тест перманентно `skip`, assertion не совпадает с текущим контентом. Удалить или обновить.

---

## 9. Конфигурация и сборка (5/10)

### `[MAJOR]` `validate-branch-name` — production dependency вместо dev

**Файл:** `package.json:51`

```json
"validate-branch-name": "^1.3.2"
```

Инструмент для git hooks находится в `dependencies` вместо `devDependencies`. Будет включён в production bundle.

**Исправление:** Перенести в `devDependencies`.

### `[MAJOR]` `dotenv` — неиспользуемый production dependency

**Файл:** `package.json:48`

```json
"dotenv": "^17.3.1"
```

`dotenv` не импортируется нигде в исходном коде frontend. Angular CLI обрабатывает env-переменные самостоятельно.

**Исправление:** Удалить или перенести в `devDependencies`.

### `[MINOR]` ESLint ignores `**/*.js` — конфиг ESLint не линтит себя

**Файл:** `eslint.config.cjs:10`

```js
ignores: ['**/node_modules/**', '**/dist/**', '**/*.js'],
```

`**/*.js` исключает все JavaScript файлы, включая сам `eslint.config.cjs`.

### `[SUGGESTION]` `@angular/cdk` указан и в dependencies, и в devDependencies

**Файл:** `package.json:34,59`

```json
"dependencies": { "@angular/cdk": "~21.1.5" },
"devDependencies": { "@angular/cdk": "^21.1.5" }
```

Дублирование с разными semver-стратегиями (`~` vs `^`). Оставить только в `dependencies`.

---

## 10. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)

- [ ] Создать `AuthGuard` (functional `CanActivateFn`) и защитить роут `/user-profile` (Angular v20 Guards)
- [ ] Создать `AuthInterceptor` (`HttpInterceptorFn`) для отправки access token (Angular v20 `withInterceptors`)
- [ ] Реализовать auto-refresh token при загрузке через `APP_INITIALIZER`
- [ ] Исправить `ThemeService` — SSR-safe через `inject(DOCUMENT)` (Angular Component Skill)
- [ ] Исправить `provideTranslocoPersistLang` — `useFactory` вместо `useValue`
- [ ] Написать реальные тесты для `AuthService`, `ThemeService`, `Login`

### Приоритет 2 (важно)

- [ ] Исправить опечатку `LaguageSwitcher` → `LanguageSwitcher`
- [ ] Исправить опечатку `AppTosterService` → `AppToasterService`
- [ ] Добавить `ChangeDetectionStrategy.OnPush` ко **всем** компонентам (Angular Component Skill — обязательно)
- [ ] Реализовать страницу Registration (форма регистрации)
- [ ] Привязать `checked` checkbox к текущей теме в ThemeSwitcher
- [ ] Изменить проверку `error.status === 403` → `401` в login (синхронно с backend)
- [ ] Перенести `validate-branch-name` и `dotenv` из `dependencies`
- [ ] Перевести `LaguageSwitcher` на signals (Angular Signals Skill)
- [ ] Использовать `asReadonly()` для публичных signals в сервисах (Angular Signals Skill — Service State Pattern)

### Приоритет 3 (желательно)

- [ ] Удалить мёртвый `title` signal в `App`
- [ ] Удалить избыточный `standalone: true` (Angular 21 default)
- [ ] Исправить `<html lang="en">` и `<title>Frontend</title>`
- [ ] Исправить `grid-template-columns` в header
- [ ] Заменить `getInputError` method binding на `computed()` signal (Angular Signals Skill)
- [ ] Реализовать страницу NotFound с полноценным дизайном
- [ ] Удалить или обновить skipped тест в `app.spec.ts`
- [ ] Убрать дубликат `@angular/cdk` из devDependencies

---

## Ссылки на документацию

| Тема                             | Ссылка                                                                 |
| -------------------------------- | ---------------------------------------------------------------------- |
| Angular v20 Route Guards         | https://v20.angular.dev/guide/routing/route-guards                     |
| Angular HttpInterceptorFn        | https://v20.angular.dev/api/common/http/HttpInterceptorFn              |
| Angular withInterceptors         | https://v20.angular.dev/api/common/http/withInterceptors               |
| Angular Signals Tutorial         | https://v20.angular.dev/tutorials/signals                              |
| Angular OnPush + Signals         | https://v20.angular.dev/tutorials/signals/1-creating-your-first-signal |
| Angular Component Best Practices | https://v20.angular.dev/style-guide                                    |
| Angular SSR / DOCUMENT           | https://v20.angular.dev/guide/ssr                                      |
| Taiga UI Components              | https://taiga-ui.dev                                                   |
| Transloco                        | https://jsverse.github.io/transloco                                    |

---

## История ревью

| Дата       | Общая оценка | Критических | Мажорных | Минорных |
| ---------- | ------------ | ----------- | -------- | -------- |
| 2026-03-09 | 4.5/10       | 6           | 8        | 9        |
