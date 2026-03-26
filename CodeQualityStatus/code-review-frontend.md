# Frontend Code Review — MeowVault

## Дата ревью: 2026-03-25

## Общая оценка: 5.0/10

С предыдущего ревью (2026-03-19): добавлена навигация после успешной регистрации, `ThemeSwitcher` теперь корректно отображает текущую тему (`[checked]`), исправлена опечатка `ThemeSwither` в spec-файле, удалён неиспользуемый `title` signal в `App`. Появился `Decrypto`-компонент, `UserProfile settings` с `AccountForm`/`PasswordForm`, `PopupService`, `KeyStorageService`. Новый функциональный код (`UserStore`, `AccountForm`) написан лучше предыдущего — использует signals, `effect()`, `OnPush`. Однако `RegistrationService` по-прежнему дублирует `AuthService.register()`, `DecryptoGameService` хранит состояние в публичных мутабельных полях, `effect()` в `AccountForm` используется для мутации формы, дублируется HTTP-запрос при инициализации `Decrypto`, в production-коде остался `console.log`.

> **Источники best practices:** [Angular v20+ Docs](https://angular.dev), Angular Signals Skill, Angular Component Skill, [Taiga UI](https://taiga-ui.dev)

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 4/10 | Существенные замечания | ↓ |
| 2. Компоненты и Angular-паттерны | 5/10 | Существенные замечания | = |
| 3. Управление состоянием (Signals, RxJS) | 4/10 | Существенные замечания | ↓ |
| 4. Формы и валидация | 6/10 | Есть замечания | ↑ |
| 5. Безопасность (фронтенд) | 5/10 | Существенные замечания | = |
| 6. i18n и локализация | 6/10 | Есть замечания | = |
| 7. Стили и UI/UX | 5/10 | Есть замечания | = |
| 8. Тестирование | 6/10 | Есть замечания | ↑ |
| 9. Конфигурация и сборка | 5/10 | Существенные замечания | = |

---

## 1. Архитектура и структура проекта (4/10)

### `[RESOLVED]` Навигация после успешной регистрации — добавлена

**Файл:** `src/app/pages/registration/registration.ts:74`

```ts
this.router.navigate([getRoutePath(AppRoute.MAIN)]);
```

---

### `[CRITICAL]` `RegistrationService` дублирует `AuthService.register()` — токен не попадает в `AuthService` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/register-service.ts:12`, `src/app/pages/registration/registration.ts:44,73`

> **Принцип DRY / Single Source of Truth:** `AuthService.register()` и `RegistrationService.register()` оба отправляют `POST /auth/register`. `RegistrationService` хранит `accessToken` в **своём** приватном signal. После регистрации `AuthService.isLoggedIn()` = `false` — пользователь авторизован лишь формально.

```ts
// register-service.ts
private accessToken = signal<string | null>(null); // изолирован от AuthService
// registration.ts
await firstValueFrom(this.registrationService.register(User));
// После этого AuthService.isLoggedIn() === false!
```

**Исправление:** Удалить `RegistrationService`. Использовать `AuthService.register()` напрямую:
```ts
private authService = inject(AuthService);
await firstValueFrom(this.authService.register(dto));
this.router.navigate([getRoutePath(AppRoute.MAIN)]);
```

---

### `[MAJOR]` Header всегда отображает `user_bar` без проверки авторизации — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/layout/header/header.html:10-28`

Блок `.user_bar` с аватаром и кнопкой "Выход" показывается неавторизованным пользователям.

**Исправление:**
```html
@if (authService.isLoggedIn()) {
  <div class="user_bar">...</div>
} @else {
  <button tuiButton routerLink="/login">{{ t('login') }}</button>
}
```

---

### `[MAJOR]` Duplicate `LoginResponse` interface — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/registration/models/register.interfaces.ts:6-8`

Определён отдельный `LoginResponse`, идентичный `auth/models/auth.interfaces.ts`. Нарушение DRY.

**Исправление:** Импортировать `LoginResponse` из `auth/models/auth.interfaces.ts`.

---

### `[MAJOR]` `KeyStorageService` — обработка ошибок в неправильном слое — НОВОЕ

**Файл:** `src/app/core/services/key-storage/key-storage-service.ts:21-27`

> **Принцип Single Responsibility:** HTTP-сервис не должен содержать UI-нотификации. [Angular Style Guide — Services](https://angular.dev/style-guide#services)

`KeyStorageService.handleError` самостоятельно показывает тостер при HTTP-ошибках. Контекст ошибки (какое сообщение показать) должен определять вызывающий код. Сравните с `UserStore` — там сервис бросает ошибку, store её обрабатывает.

**Исправление:** Удалить `handleError` из сервиса. Пусть сервис бросает ошибку, а вызывающий код (компонент/store) показывает тостер.

---

## 2. Компоненты и Angular-паттерны (5/10)

### `[RESOLVED]` Опечатка `ThemeSwither` в `theme-switcher.spec.ts` — исправлена

---

### `[RESOLVED]` `App` — неиспользуемый signal `title` — удалён

---

### `[MAJOR]` Опечатка `LaguageSwitcher` — НЕ ИСПРАВЛЕНО

**Файлы:** `core/components/language-switcher/language-switcher.ts:15`, `core/layout/header/header.ts:6,21`

```ts
export class LaguageSwitcher // должно быть LanguageSwitcher
```

---

### `[MAJOR]` Опечатка `AppTosterService` — НЕ ИСПРАВЛЕНО

**Файлы:** `core/services/app-toster-service.ts:21`, `pages/login/login.ts:27`, `pages/registration/registration.ts:17`

Переименовать в `AppToasterService`, `TosterLabels` → `ToasterLabels`, `TosterAppearances` → `ToasterAppearances`.

---

### `[MAJOR]` Компоненты без `ChangeDetectionStrategy.OnPush` — НЕ ИСПРАВЛЕНО

Отсутствует в: `App`, `Header`, `Footer`, `UserProfile`, `Login`, `ProfileSidebar`, `ProfileStats`, `RecentActivity`, `Decrypto`, `Timer`.

> **Angular Component Skill:** `OnPush` обязателен при использовании Signals. [Angular — Change detection](https://angular.dev/best-practices/skipping-subtrees)

---

### `[MAJOR]` `styleUrls` вместо `styleUrl` — НЕ ИСПРАВЛЕНО

**Файлы:** `pages/registration/registration.ts:23`, `pages/main/main.ts:26`

> [Angular styleUrl migration](https://angular.dev/reference/migrations/style-urls)

```ts
styleUrls: ['./registration.scss'], // устаревший API
```

**Исправление:** `styleUrl: './registration.scss'`

---

### `[MAJOR]` `Decrypto.console.log` в production-коде — НОВОЕ

**Файл:** `src/app/components/games/decrypto/decrypto.ts:132`

```ts
console.log(this.gameStarted());
```

Отладочный вывод в методе `newGame()`. Должен быть удалён перед слиянием.

---

### `[MAJOR]` `Decrypto` обращается к методам дочернего компонента через `viewChild` — НОВОЕ

**Файл:** `src/app/components/games/decrypto/decrypto.ts:52,98-102`

```ts
private timerRef = viewChild(Timer);
// ...
this.timerRef()?.start();
this.timerRef()?.stop();
this.timerRef()?.reset();
```

> Прямой вызов методов дочернего компонента нарушает однонаправленный поток данных. [Angular — Component interaction](https://angular.dev/guide/components/inputs)

**Исправление:** Передавать команды через `@Input()` signal или `@Output()` — `timerCommand = input<'start' | 'stop' | 'reset'>()`.

---

### `[MINOR]` `standalone: true` избыточно в Angular 21 — НЕ ИСПРАВЛЕНО

**Файлы:** `language-switcher.ts:9`, `theme-switcher.ts:9`, `not-found.ts:14`

В Angular 19+ все компоненты standalone по умолчанию.

---

## 3. Управление состоянием (Signals, RxJS) (4/10)

### `[MAJOR]` `AuthService` — `isRefreshing` и `refreshSubject` публичные — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/auth/auth-service.ts:16-17`

```ts
public isRefreshing = false;
public refreshSubject = new BehaviorSubject<string | null>(null);
```

> [Angular — Services best practices](https://angular.dev/style-guide#services)

---

### `[MAJOR]` `DecryptoGameService` — шесть публичных мутабельных массивов — НОВОЕ

**Файл:** `src/app/components/games/decrypto/services/decrypto-game-service.ts:18-23`

```ts
public gameCards: Card[] = StartGameCards;
public gameCardsForGame: Card[] = StartGameCards;
public gameCardsFromServer: Card[] = [];
public gameWrightCode: number[] = [];
public gameWrightCodes: number[][] = [];
public gameHints: string[][] = [];
```

Поля напрямую изменяются снаружи (`decrypto.ts:59` — `this.gameService.gameCardsFromServer = data.storage.gameCards`). Angular не отслеживает такие изменения реактивно при `OnPush`.

> [Angular Signals](https://angular.dev/guide/signals)

**Исправление:** Заменить на signals с readonly-геттерами:
```ts
private readonly _gameCards = signal<Card[]>(StartGameCards);
readonly gameCards = this._gameCards.asReadonly();
setGameCards(cards: Card[]) { this._gameCards.set(cards); }
```

---

### `[MAJOR]` `Decrypto.ngOnInit` — дублирующий вызов `loadDataServerService.getData` — НОВОЕ

**Файл:** `src/app/components/games/decrypto/decrypto.ts:56-61`

При инициализации вызывается `loadDataServerService.getData()`, и следом `newGame()` — который тоже вызывает `getData()` если `gameCardsFromServer.length === 0`. Два параллельных HTTP-запроса при каждом монтировании компонента.

**Исправление:** Убрать прямой вызов `getData()` из `ngOnInit`, оставить только через `newGame()`.

---

### `[MAJOR]` `AccountForm` — `effect()` мутирует реактивную форму — НОВОЕ

**Файл:** `src/app/pages/user-profile/components/profile-settings/account-form/account-form.ts:69-83`

```ts
private readonly syncUserToFormEffect = effect(() => {
  const user = this.userStore.user();
  if (!user || this.isAccountEditMode()) return;
  this.accountForm.patchValue({ ... }, { emitEvent: false });
});
```

> `effect()` не предназначен для мутации состояния вне сигнальной системы. [Angular — effects](https://angular.dev/guide/signals#effects)

**Исправление:** Использовать `toSignal(this.userStore.user$)` + заполнение формы в `ngOnChanges`, или `linkedSignal()` для реактивной синхронизации.

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

### `[MINOR]` `AppTosterService` — подписки без `takeUntilDestroyed` — НЕ ИСПРАВЛЕНО

**Файл:** `core/services/app-toster-service.ts`

---

### `[MINOR]` `ProfileSidebar` — `toSignal` с дублирующим `startWith` и `initialValue` — НОВОЕ

**Файл:** `src/app/pages/user-profile/components/profile-sidebar/profile-sidebar.ts:32-35`

```ts
protected readonly activeLang = toSignal(
  this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang())),
  { initialValue: this.translocoService.getActiveLang() }, // дублирует startWith
);
```

`startWith` гарантирует синхронное начальное значение — `initialValue` избыточен.

**Исправление:** Убрать `{ initialValue: ... }` — достаточно `startWith`.

---

## 4. Формы и валидация (6/10)

### `[MAJOR]` `Registration.submit()` — `throw new Error` для валидационных данных — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/registration/registration.ts:65-66`

```ts
if (!username || !email || !password)
  throw new Error(this.translocoService.translate('registration.error.invalidData'));
```

`throw` внутри `async` без внешнего catch = unhandled promise rejection. Это ошибка валидации, не программная ошибка.

**Исправление:**
```ts
if (this.registrationForm.invalid) return;
```

---

### `[MINOR]` `Registration` — отсутствует `isLoading` при отправке формы — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/registration/registration.ts:63`

В отличие от `Login`, кнопка отправки не блокируется во время HTTP-запроса.

**Исправление:**
```ts
protected isLoading = signal(false);
// в submit(): isLoading.set(true) / finally isLoading.set(false)
// в шаблоне: [disabled]="isLoading()"
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

### `[MINOR]` `autocomplete="current-password"` на полях регистрации — НЕ ИСПРАВЛЕНО

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

### `[MAJOR]` Main — внешний CDN URL для иконки — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/main/main.html:13`

```html
<tui-icon icon="https://cdn-icons-png.flaticon.com/64/12710/12710759.png" class="hover" />
```

> Внешний CDN нарушает CSP, создаёт зависимость от третьей стороны. [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

**Исправление:** Сохранить иконку в `public/assets/icons/`.

---

## 6. i18n и локализация (6/10)

### `[RESOLVED]` `index.html` — `lang="ru"` — добавлен

### `[RESOLVED]` `<title>MeowVault</title>` — добавлен

---

### `[MINOR]` Hardcoded `'...'` вместо i18n-ключа — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/login/login.html:87`

```html
{{ isLoading() ? '...' : t('login.buttons.login') }}
```

---

### `[MINOR]` Неиспользуемые ключи перевода в login — НЕ ИСПРАВЛЕНО

**Файл:** `public/i18n/login/ru.json` — `loginWorks`, `buttons.google`, `divider`

---

### `[MINOR]` Опечатка `mismathPassword` в переводах — НЕ ИСПРАВЛЕНО

**Файлы:** `public/i18n/user-profile/ru.json:51`, `en.json:51`

```json
"mismathPassword": "Пароли не совпадают"
```

`mismath` → `mismatch`. Используется в `password-form.ts:112`.

---

### `[MAJOR]` Захардкоженные строки в UserProfile без i18n — НЕ ИСПРАВЛЕНО

**Файлы:** `profile-sidebar.html:25-26`, `profile-stats.html`, `recent-activity.html`

`"Racing"`, `"Puzzle"`, `127`, `45,820`, `32`, `"2"`, `"5"` — всё статично, без привязки к данным.

---

## 7. Стили и UI/UX (5/10)

### `[RESOLVED]` `ThemeSwitcher` — checkbox привязан к текущей теме

**Файл:** `core/components/theme-switcher/theme-switcher.html:1`

```html
<input tuiLike type="checkbox" [checked]="themeService.theme() === ThemeNames.Light" ... />
```

---

### `[MAJOR]` Main — 6 захардкоженных карточек-заглушек `"Replace me"` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/main/main.html:36,46,56,66,76,86`

6 копипастных блоков с `<section>Replace me</section>`.

**Исправление:** Создать массив данных об играх и рендерить через `@for`.

---

### `[MINOR]` Кнопка "Начать" без действия — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/main/main.html:26-28`

Нет `routerLink`, нет `(click)` — мёртвый элемент.

---

### `[SUGGESTION]` `console.log` в обработчике ошибки logout — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/layout/header/header.ts:41`

**Исправление:** `appTosterService.showErrorToster(...)` с переведённым сообщением.

---

## 8. Тестирование (6/10)

Значительный прогресс: добавлены содержательные тесты для `Timer`, `ThemeSwitcher`, `AccountForm`, `DecryptoGameService`. Smoke-тесты всё ещё преобладают.

### `[CRITICAL]` Интерцептор (bearer token, refresh queue, retry) — ноль значимых тестов — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/auth/auth-interceptor.spec.ts`

Остаётся smoke-тест.

---

### `[MAJOR]` `register-service.spec.ts` — describe называется `'AuthService'` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/register-service.spec.ts:4`

```ts
describe('AuthService', () => { // должно быть 'RegistrationService'
```

---

### `[MINOR]` Smoke-тесты не покрывают логику — НЕ ИСПРАВЛЕНО (частично)

Остаются smoke-уровня: `login.spec.ts`, `user-profile.spec.ts`, `footer.spec.ts`, `img-cat.spec.ts`, `user-store.spec.ts`.

---

## 9. Конфигурация и сборка (5/10)

### `[MAJOR]` `validate-branch-name` и `dotenv` — production dependencies — НЕ ИСПРАВЛЕНО

**Файл:** `frontend/package.json`

```json
"dotenv": "^17.3.1",
"validate-branch-name": "^1.3.2"
```

Оба — dev-зависимости. Их присутствие в `dependencies` увеличивает production-бандл.

**Исправление:** Перенести в `devDependencies`.

---

### `[MINOR]` `EyeCompassDirective` — не используется ни в одном компоненте — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/directive/eye-compass.directive.ts`

Директива реализована для `[data-pupil]`, но в `registration.html` SVG использует `#pupil` — директива не активируется никогда.

---

## 10. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Удалить `RegistrationService` — использовать `AuthService.register()` на странице регистрации
- [ ] Исправить `ThemeService` — SSR-safe через `inject(DOCUMENT)`
- [ ] Добавить `@if (authService.isLoggedIn())` в Header
- [ ] Убрать `throw new Error` → `return` в `registration.submit()`

### Приоритет 2 (важно)
- [ ] Заменить `DecryptoGameService` публичные массивы на signals с методами-сеттерами
- [ ] Убрать `console.log(this.gameStarted())` из `decrypto.ts:132`
- [ ] Исправить дублирующий HTTP-запрос в `Decrypto.ngOnInit`
- [ ] Заменить `effect()` для `patchValue` в `AccountForm` на `toSignal` + `ngOnChanges`
- [ ] Переименовать `LaguageSwitcher` → `LanguageSwitcher`
- [ ] Переименовать `AppTosterService` → `AppToasterService`
- [ ] Добавить `OnPush` во все компоненты без него
- [ ] Перенести `isRefreshing`/`refreshSubject` в `private`
- [ ] Изменить `error.status === 403` → `401` в login
- [ ] Заменить "Replace me" карточки на данные из массива/API
- [ ] Убрать внешний CDN URL — сохранить иконку локально
- [ ] Перенести `validate-branch-name` и `dotenv` в `devDependencies`
- [ ] Перевести `LaguageSwitcher` на signals
- [ ] Заменить `styleUrls` → `styleUrl`
- [ ] Убрать дублирующий `LoginResponse` из `register.interfaces.ts`
- [ ] Заменить `viewChild` для вызова методов таймера на signal input
- [ ] Убрать `handleError` из `KeyStorageService`

### Приоритет 3 (желательно)
- [ ] Добавить `isLoading = signal(false)` в Registration
- [ ] Исправить `autocomplete="current-password"` → `"new-password"` в регистрации
- [ ] Исправить опечатку `mismathPassword` в переводах
- [ ] Добавить действие кнопке "Начать" на Main
- [ ] Добавить реальные тесты для интерцептора
- [ ] Исправить `register-service.spec.ts` describe name
- [ ] Удалить избыточный `standalone: true`
- [ ] Удалить/подключить `EyeCompassDirective`
- [ ] Удалить `console.log` в `header.ts:41`
- [ ] Убрать лишний `initialValue` в `ProfileSidebar.activeLang`
- [ ] Заменить `getInputError` method binding на `computed()`
- [ ] Захардкоженные данные в профиле заменить данными из API

---

## Ссылки на документацию

| Тема | Ссылка |
|------|--------|
| Angular v20 Route Guards | https://angular.dev/guide/routing/route-guards |
| Angular Signals | https://angular.dev/guide/signals |
| Angular Effects | https://angular.dev/guide/signals#effects |
| Angular OnPush + Signals | https://angular.dev/best-practices/skipping-subtrees |
| Angular Component Interaction | https://angular.dev/guide/components/inputs |
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
| 2026-03-25 | 5.0/10 | 3 | 18 | 12 |
