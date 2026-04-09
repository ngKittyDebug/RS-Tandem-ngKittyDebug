# Frontend Code Review — MeowVault

## Дата ревью: 2026-04-09

## Общая оценка: 5.0/10

С предыдущего ревью (2026-03-25): 11 замечаний закрыты — это лучший показатель за все циклы. Удалён `RegistrationService` (CRITICAL), Header теперь проверяет `isLoggedIn()`, убраны захардкоженные карточки `"Replace me"` и заглушки профиля, убран `console.log` в `decrypto.ts`, исправлен `throw new Error` → `return`. Появились новые игровые компоненты (`CitiesGame`, `Hangman`, `EventLoopGame`), но они принесли новые проблемы: прямые обращения к HuggingFace Inference API с пустым токеном на клиенте (CRITICAL), незакрытые HTTP-подписки, захардкоженные маршруты, debug-логи в production.

> **Источники best practices:** [Angular v20+ Docs](https://angular.dev), Angular Signals Skill, Angular Component Skill, [Taiga UI](https://taiga-ui.dev)

---

## Сводная таблица оценок

| Категория | Оценка | Статус | Δ |
|-----------|--------|--------|---|
| 1. Архитектура и структура проекта | 5/10 | Существенные замечания | ↑ |
| 2. Компоненты и Angular-паттерны | 5/10 | Существенные замечания | = |
| 3. Управление состоянием (Signals, RxJS) | 4/10 | Существенные замечания | = |
| 4. Формы и валидация | 6/10 | Есть замечания | = |
| 5. Безопасность (фронтенд) | 4/10 | Критические проблемы | ↓ |
| 6. i18n и локализация | 6/10 | Есть замечания | = |
| 7. Стили и UI/UX | 5/10 | Есть замечания | = |
| 8. Тестирование | 5/10 | Существенные замечания | ↓ |
| 9. Конфигурация и сборка | 5/10 | Существенные замечания | = |

---

## 1. Архитектура и структура проекта (5/10)

### `[RESOLVED]` Навигация после успешной регистрации — добавлена

**Файл:** `src/app/pages/registration/registration.ts:74`

---

### `[RESOLVED]` `RegistrationService` удалён — `AuthService.register()` используется напрямую

**Файл:** `src/app/pages/registration/registration.ts`

---

### `[RESOLVED]` `Header` — добавлена проверка `@if (authService.isLoggedIn())`

**Файл:** `src/app/core/layout/header/header.html`

---

### `[RESOLVED]` Duplicate `LoginResponse` interface — удалён

**Файл:** `src/app/pages/registration/models/register.interfaces.ts`

---

### `[MAJOR]` `KeyStorageService` — обработка ошибок в неправильном слое — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/key-storage/key-storage-service.ts:21-27`

> **Принцип Single Responsibility:** HTTP-сервис не должен содержать UI-нотификации. [Angular Style Guide — Services](https://angular.dev/style-guide#services)

`KeyStorageService.handleError` самостоятельно показывает тостер при HTTP-ошибках. Контекст ошибки должен определять вызывающий код.

**Исправление:** Удалить `handleError` из сервиса. Пусть сервис бросает ошибку, а вызывающий код (компонент/store) показывает тостер.

---

### `[MAJOR]` Захардкоженные маршруты в `MergeGame`, `Board`, `Quiz` — НОВОЕ

**Файлы:** `src/app/components/games/merge-game/merge-game.ts:26,32`, `components/board/board.ts:87`, `components/quiz/quiz.ts:94`

> **Правило** (Maintainability): Захардкоженные строки маршрутов дублируют `AppRoute`/`MergeGameRoute` enum и ломаются при рефакторинге.

```ts
// merge-game.ts, board.ts
this.router.navigate(['/merge-game/settings']); // захардкожено

// quiz.ts
this.router.navigate(['/merge-game/board']); // захардкожено
```

**Исправление:**
```ts
import { GameRoute, MergeGameRoute } from '../../../app.routes';
this.router.navigate([`/${GameRoute.MERGE_GAME}/${MergeGameRoute.SETTINGS}`]);
```

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

Отсутствует в: `App`, `Header`, `Footer`, `UserProfile`, `Login`, `ProfileSidebar`, `RecentActivity`, `Decrypto`, `Timer`, `Board`, `MergeGame`, `Settings`, `Quiz`.

> **Angular Component Skill:** `OnPush` обязателен при использовании Signals. [Angular — Change detection](https://angular.dev/best-practices/skipping-subtrees)

---

### `[MAJOR]` `styleUrls` вместо `styleUrl` — НЕ ИСПРАВЛЕНО + НОВЫЕ ФАЙЛЫ

**Файлы:** `pages/registration/registration.ts:27`, `components/games/cities-game/cities-game.ts:64`, `components/games/hangman/hangman.ts:17`

> [Angular styleUrl migration](https://angular.dev/reference/migrations/style-urls)

```ts
styleUrls: ['./registration.scss'], // устаревший API во всех трёх файлах
```

**Исправление:** `styleUrl: './file.scss'`

---

### `[MAJOR]` `Decrypto` — прямой вызов методов дочернего компонента через `viewChild` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/components/games/decrypto/decrypto.ts:52,98-102`

```ts
private timerRef = viewChild(Timer);
this.timerRef()?.start();
this.timerRef()?.stop();
this.timerRef()?.reset();
```

> Прямой вызов методов дочернего компонента нарушает однонаправленный поток данных. [Angular — Component interaction](https://angular.dev/guide/components/inputs)

**Исправление:** `timerCommand = input<'start' | 'stop' | 'reset'>()`

---

### `[MAJOR]` `[OAuth-Debug]` debug-логи в production-коде — НОВОЕ

**Файлы:**
- `src/app/core/services/auth/auth-service.ts:65`
- `src/app/app.config.ts:76`
- `src/app/app.ts:48`

```ts
console.warn('[OAuth-Debug] refresh() failed:', err.status, err.message);
console.warn('[OAuth-Debug] APP_INITIALIZER: refresh failed:', err.status ?? err.message);
console.warn('[OAuth-Debug] bfcache revalidation failed:', err.status ?? err.message);
```

**Исправление:** Удалить или заменить на `LoggerService`, который в production не выводит сообщения.

---

### `[MAJOR]` `CitiesGame` — `CommonModule` вместо точечных импортов — НОВОЕ

**Файл:** `src/app/components/games/cities-game/cities-game.ts:72`

> **Правило** (Angular 17+ Standalone best practices): `CommonModule` импортирует весь модуль, увеличивая bundle. [Angular — Standalone Components](https://angular.dev/guide/components/importing)

```ts
imports: [
  CommonModule, // избыточный импорт целого модуля
```

**Исправление:** заменить на `NgIf`, `NgFor`, `AsyncPipe` или использовать встроенные `@if`/`@for`.

---

### `[MINOR]` `standalone: true` избыточно в Angular 19+ — НЕ ИСПРАВЛЕНО (+ новые файлы)

**Файлы:** `language-switcher.ts:9`, `theme-switcher.ts:9`, `not-found.ts:14`, `registration.ts:28`, `hangman.ts:13`, `game.component.ts:44`

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

Любой компонент может сбросить флаг рефреша, разрушив логику очереди параллельных 401.

**Исправление:** `private`, добавить методы `startRefresh()`, `completeRefresh(token)`, `getRefreshObservable()`.

---

### `[MAJOR]` `DecryptoGameService` — шесть публичных мутабельных массивов — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/components/games/decrypto/services/decrypto-game-service.ts:18-23`

```ts
public gameCards: Card[] = StartGameCards;
public gameCardsForGame: Card[] = StartGameCards;
public gameCardsFromServer: Card[] = [];
public gameWrightCode: number[] = [];
public gameWrightCodes: number[][] = [];
public gameHints: string[][] = [];
```

> [Angular Signals](https://angular.dev/guide/signals)

**Исправление:**
```ts
private readonly _gameCards = signal<Card[]>(StartGameCards);
readonly gameCards = this._gameCards.asReadonly();
setGameCards(cards: Card[]) { this._gameCards.set(cards); }
```

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

### `[MAJOR]` `CitiesGame` — `forkJoin` и `getUser()` без `takeUntilDestroyed` — НОВОЕ

**Файл:** `src/app/components/games/cities-game/cities-game.ts:162-175`

> **Правило** (Memory Leak): Незакрытые подписки ведут к утечкам. [Angular RxJS — takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)

```ts
forkJoin([response_one, response_two])
  .pipe(map(...))
  .subscribe((merged) => { // нет takeUntilDestroyed
    this.words = merged;
  });

this.userService.getUser().subscribe((user) => { // нет takeUntilDestroyed
  this.userName = user.username;
});
```

`DestroyRef` injected, но не используется в этих подписках.

**Исправление:** добавить `takeUntilDestroyed(this.destroyRef)` в оба `pipe()`.

---

### `[MAJOR]` `Header.logOutClick()` — подписка без `takeUntilDestroyed` — НОВОЕ

**Файл:** `src/app/core/layout/header/header.ts:41`

```ts
protected logOutClick(): void {
  this.authService.logout().subscribe({ // нет takeUntilDestroyed
    next: () => { ... },
    error: () => { ... },
  });
}
```

**Исправление:** добавить `private readonly destroyRef = inject(DestroyRef)` и `takeUntilDestroyed(this.destroyRef)`.

---

### `[MAJOR]` `ProfileSidebar.onFileSelected()` — подписка без `takeUntilDestroyed` — НОВОЕ

**Файл:** `src/app/pages/user-profile/components/profile-sidebar/profile-sidebar.ts:77`

`cloudinaryService.uploadImage().pipe(switchMap(...)).subscribe()` без `takeUntilDestroyed`. При быстрой навигации `next` будет выполнен в уничтоженном контексте.

---

### `[MAJOR]` `Decrypto` — `retry({ count: 2, delay: 60000 })` — UI зависает на 2 минуты — НОВОЕ

**Файл:** `src/app/components/games/decrypto/decrypto.ts:77`

```ts
.pipe(
  retry({ count: 2, delay: 60000 }), // 2 минуты ожидания при ошибке
  ...
)
```

При ошибке сервера игра будет "заморожена" до 2 минут. `isLoaded` остаётся `false` — пользователь видит лоадер без сообщения об ошибке.

**Исправление:** убрать или уменьшить `delay` до 1–3 секунд, добавить `catchError` с UI-уведомлением.

---

### `[MAJOR]` `BoardService.initBoard()` — нет `catchError` — НОВОЕ

**Файл:** `src/app/components/games/merge-game/services/board-service.ts:67`

```ts
this.gameService
  .getAllCards()
  .pipe(tap(...), takeUntilDestroyed(this.destroyRef))
  .subscribe(); // нет catchError — пользователь увидит пустую доску без объяснений
```

---

### `[MAJOR]` `Hangman` — `userService.statsUpdate()` без обработки ошибок и `takeUntilDestroyed` — НОВОЕ

**Файл:** `src/app/components/games/hangman/hangman.ts:30`

```ts
this.userService.statsUpdate(GameLabels.Hangman).subscribe({}); // пустой объект, нет DestroyRef
```

---

### `[MINOR]` `AppTosterService` — подписки без `takeUntilDestroyed` — НЕ ИСПРАВЛЕНО

**Файл:** `core/services/app-toster-service.ts`

---

### `[MINOR]` `ProfileSidebar` — `toSignal` с дублирующим `startWith` и `initialValue` — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/user-profile/components/profile-sidebar/profile-sidebar.ts:32-35`

```ts
protected readonly activeLang = toSignal(
  this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang())),
  { initialValue: this.translocoService.getActiveLang() }, // дублирует startWith
);
```

**Исправление:** убрать `{ initialValue: ... }` — достаточно `startWith`.

---

### `[MINOR]` `AccountForm` — `effect()` мутирует реактивную форму

**Файл:** `src/app/pages/user-profile/components/profile-settings/account-form/account-form.ts:69-83`

```ts
private readonly syncUserToFormEffect = effect(() => {
  const user = this.userStore.user();
  if (!user || this.isAccountEditMode()) return; // isAccountEditMode() — лишняя зависимость
  this.accountForm.patchValue({ ... }, { emitEvent: false });
});
```

> `effect()` не предназначен для мутации состояния. [Angular — effects](https://angular.dev/guide/signals#effects)

Технически допустимо с `{ emitEvent: false }`, но `isAccountEditMode()` внутри `effect()` создаёт лишнюю реактивную зависимость. Рекомендация: `linkedSignal` или `toSignal` + `ngOnChanges`.

---

## 4. Формы и валидация (6/10)

### `[RESOLVED]` `Registration.submit()` — `throw new Error` → `return`

---

### `[RESOLVED]` Login — `error.status === 403` → `401`

---

### `[MINOR]` `Registration` — отсутствует `isLoading` при отправке формы — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/registration/registration.ts:63`

---

### `[MINOR]` `getInputError` вызывается как метод в шаблоне — НЕ ИСПРАВЛЕНО

**Файлы:** `login.html:49,62,77`, `registration.html:24,29,41,53`

Метод с `translocoService.translate()` вызывается при каждом цикле change detection.

**Исправление:** заменить на `computed()` signals.

---

### `[MINOR]` `autocomplete="current-password"` на полях регистрации — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/registration/registration.html:36,48`

> [MDN: autocomplete values](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values)

**Исправление:** `autocomplete="new-password"` для обоих полей пароля.

---

## 5. Безопасность (фронтенд) (4/10)

### `[CRITICAL]` `DecryptoAiService` — `HfInference` вызывается с пустым токеном на клиенте — НОВОЕ

**Файл:** `src/app/components/games/decrypto/services/decrypto-ai-service.ts:10`

> **Правило** (OWASP A02 Cryptographic Failures, CRITICAL). [OWASP Top 10 — A02](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)

`@huggingface/inference` вызывается из браузера с `''` в качестве токена. Прямые вызовы к внешним API из клиента недопустимы: при наличии реального токена он был бы виден в бандле/сетевых запросах.

```ts
private hf = new HfInference(''); // пустой токен — сломано или небезопасно
```

**Исправление:** Удалить `DecryptoAiService` с клиента. Добавить endpoint на NestJS-backend, который проксирует запросы к HuggingFace с токеном из env-переменной.

---

### `[CRITICAL]` `ThemeService.changeTheme()` — прямой `localStorage` в методе — НОВОЕ

**Файл:** `src/app/core/services/theme-service.ts:15`

> **Правило** (SSR-совместимость). [Angular — DOCUMENT token](https://angular.dev/api/common/DOCUMENT)

Конструктор исправлен (использует `inject(DOCUMENT)`), но `changeTheme()` по-прежнему вызывает `localStorage` напрямую:

```ts
public changeTheme(): void {
  this.theme.update((t) => (t === ThemeNames.Light ? ThemeNames.Dark : ThemeNames.Light));
  localStorage.setItem(STORAGE_KEYS.THEME, this.theme()); // не SSR-safe
}
```

**Исправление:**
```ts
private readonly storage = inject(DOCUMENT).defaultView?.localStorage;

public changeTheme(): void {
  this.theme.update((t) => (t === ThemeNames.Light ? ThemeNames.Dark : ThemeNames.Light));
  this.storage?.setItem(STORAGE_KEYS.THEME, this.theme());
}
```

---

### `[CRITICAL]` `GameComponent` (Hangman) — `localStorage` без `DOCUMENT` — НОВОЕ

**Файл:** `src/app/components/games/hangman/components/game/game.component.ts:96,104`

```ts
const savedStats = localStorage.getItem(this.statsStorageKey);
localStorage.setItem(this.statsStorageKey, JSON.stringify(this.stats));
```

**Исправление:** Инжектировать `DOCUMENT` и использовать `doc.defaultView?.localStorage`.

---

### `[MAJOR]` `app.config.ts` — `provideTranslocoPersistLang` с прямым `localStorage` — НОВОЕ

**Файл:** `src/app/app.config.ts:50-52`

> **Правило** (SSR-совместимость). [Transloco — persist lang](https://jsverse.github.io/transloco/docs/plugins/persist-lang)

```ts
provideTranslocoPersistLang({
  storage: {
    useFactory: () => localStorage, // прямой доступ — не SSR-safe
  },
}),
```

**Исправление:**
```ts
provideTranslocoPersistLang({
  storage: {
    useFactory: (doc: Document) =>
      doc.defaultView?.localStorage ?? { getItem: () => null, setItem: () => {} },
    deps: [DOCUMENT],
  },
}),
```

---

### `[MAJOR]` `Main` — внешний CDN URL для иконки — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/main/main.html:13`

```html
<tui-icon icon="https://cdn-icons-png.flaticon.com/64/12710/12710759.png" />
```

> Внешний CDN нарушает CSP. [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

**Исправление:** сохранить иконку в `public/assets/icons/`.

---

### `[MINOR]` `decrypto-ai-service.ts` — `console.error` с русским текстом — НОВОЕ

**Файл:** `src/app/components/games/decrypto/services/decrypto-ai-service.ts:36`

```ts
console.error('Ошибка API:', err); // debug-вывод, смешение языков
```

---

### `[SUGGESTION]` `index.html` — отсутствует `Content-Security-Policy` meta-тег — НОВОЕ

> [MDN — Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

Нет `<meta http-equiv="Content-Security-Policy" content="...">`. С учётом внешних ресурсов (Cloudinary, HuggingFace, GitHub OAuth) — риск.

---

## 6. i18n и локализация (6/10)

### `[RESOLVED]` `index.html` — `lang="ru"` добавлен, `<title>MeowVault</title>` добавлен

### `[RESOLVED]` Захардкоженные строки в UserProfile — переведены через Transloco

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

**Файлы:** `public/i18n/user-profile/ru.json:64`, `en.json`, `password-form.ts:114`

```json
"mismathPassword": "Пароли не совпадают" // mismath → mismatch
```

Работает только потому что опечатка одинаковая в JSON и в коде — технический долг.

---

## 7. Стили и UI/UX (5/10)

### `[RESOLVED]` `ThemeSwitcher` — checkbox привязан к текущей теме

### `[RESOLVED]` `Main` — 6 карточек `"Replace me"` убраны

---

### `[MINOR]` Кнопка "Начать" без действия — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/pages/main/main.html:26-28`

Нет `routerLink`, нет `(click)` — мёртвый элемент.

---

### `[SUGGESTION]` `console.log` в обработчике ошибки logout — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/layout/header/header.ts:41`

**Исправление:** `appTosterService.showErrorToster(...)` с переведённым сообщением.

---

### `[MINOR]` `Board` (merge-game) — HTML-теги в строке тостера — НОВОЕ

**Файл:** `src/app/components/games/merge-game/components/board/board.ts:42`

```ts
const message = `🎮 ${...}: ${mode} <br> ✅ ${...}: ${correctAnswers} / ${total}`;
this.tosterService.showPositiveToster(message, ...);
```

Если Taiga UI рендерит `message` как HTML, использование `<br>` создаёт вектор инъекции при динамических данных.

---

## 8. Тестирование (5/10)

### `[CRITICAL]` Интерцептор (bearer token, refresh queue, retry) — ноль значимых тестов — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/services/auth/auth-interceptor.spec.ts`

Остаётся smoke-тест.

---

### `[MINOR]` `board.spec.ts` — дублирующий провайдер `Router` — НОВОЕ

**Файл:** `src/app/components/games/merge-game/components/board/board.spec.ts:66-74`

```ts
providers: [
  { provide: Router, useValue: { navigate: (): void => {} } },
  { provide: Router, useValue: routerMock }, // перезаписывает первый
],
```

Первый провайдер бесполезен — Angular использует последний в массиве.

---

### `[MINOR]` Smoke-тесты не покрывают логику — НЕ ИСПРАВЛЕНО (частично)

Остаются smoke-уровня: `login.spec.ts`, `user-profile.spec.ts`, `footer.spec.ts`, `img-cat.spec.ts`, `user-store.spec.ts`, `hangman.spec.ts`, `cities-game.spec.ts`.

---

### `[SUGGESTION]` `Quiz.wordsToAsk` — `computed()` с `Math.random()` — НОВОЕ

**Файл:** `src/app/components/games/merge-game/components/quiz/quiz.ts:37-40`

> **Правило** (Angular Signals — computed пурность): `computed()` должен быть детерминированным.

```ts
private readonly wordsToAsk = computed(() => {
  const words = [...(this.activeQuiz()?.words ?? [])];
  return words.sort(() => Math.random() - 0.5).slice(0, this.wordCount()); // не детерминировано
});
```

При переходе к следующему вопросу `currentIndex` меняется → `wordsToAsk` пересчитывается → порядок слов меняется. Пользователь может получить другой набор слов после ответа.

**Исправление:** вынести перемешивание в `effect()` при изменении `activeQuiz`, сохранять результат в `signal`.

---

## 9. Конфигурация и сборка (5/10)

### `[MAJOR]` `validate-branch-name` и `dotenv` — production dependencies — НЕ ИСПРАВЛЕНО

**Файл:** `frontend/package.json`

```json
"dotenv": "^17.3.1",
"validate-branch-name": "^1.3.2"
```

**Исправление:** Перенести в `devDependencies`.

---

### `[MINOR]` `EyeCompassDirective` — не используется ни в одном компоненте — НЕ ИСПРАВЛЕНО

**Файл:** `src/app/core/directive/eye-compass.directive.ts`

Директива реализована для `[data-pupil]`, но в `registration.html` SVG использует `#pupil` — директива не активируется никогда.

---

### `[MINOR]` `ProfileSidebar` — дублирующий импорт `TuiHeader` — НОВОЕ

**Файл:** `src/app/pages/user-profile/components/profile-sidebar/profile-sidebar.ts:33-35`

```ts
imports: [
  TuiHeader,
  TuiHeader, // дублируется
],
```

---

### `[MINOR]` `UserProfile` — избыточный тип `signal<StatsResponseData[] | []>` — НОВОЕ

**Файл:** `src/app/pages/user-profile/user-profile.ts:28`

```ts
protected readonly stats = signal<StatsResponseData[] | []>([]); // | [] избыточен
```

`[]` — подтип `StatsResponseData[]`. То же в `ProfileSidebar` и `RecentActivity`.

**Исправление:** `signal<StatsResponseData[]>([])`

---

## 10. Рекомендации к следующему ревью

### Приоритет 1 (обязательно)
- [ ] Удалить `DecryptoAiService` с клиента — перенести HuggingFace вызовы на backend
- [ ] Исправить `ThemeService.changeTheme()` — использовать `this.storage?.setItem(...)`
- [ ] Исправить `GameComponent` (Hangman) — `localStorage` через `inject(DOCUMENT)`
- [ ] Удалить все `[OAuth-Debug]` console.warn из production-кода

### Приоритет 2 (важно)
- [ ] Добавить `takeUntilDestroyed` в `CitiesGame` — `forkJoin` и `getUser()`
- [ ] Добавить `takeUntilDestroyed` в `Header.logOutClick()`
- [ ] Добавить `takeUntilDestroyed` в `ProfileSidebar.onFileSelected()`
- [ ] Исправить `Decrypto retry delay: 60000` → 1–3 секунды + `catchError`
- [ ] Добавить `catchError` в `BoardService.initBoard()`
- [ ] Добавить обработку ошибок в `Hangman.statsUpdate()`
- [ ] Исправить `provideTranslocoPersistLang` — использовать `DOCUMENT` dep
- [ ] Заменить захардкоженные маршруты `/merge-game/settings` и `/merge-game/board` на enum
- [ ] Перенести `isRefreshing`/`refreshSubject` в `private`
- [ ] Заменить `DecryptoGameService` публичные массивы на signals с методами-сеттерами
- [ ] Убрать `[OAuth-Debug]` console.warn
- [ ] Переименовать `LaguageSwitcher` → `LanguageSwitcher`
- [ ] Переименовать `AppTosterService` → `AppToasterService`
- [ ] Добавить `OnPush` во все компоненты без него
- [ ] Заменить `styleUrls` → `styleUrl` во всех файлах
- [ ] Перевести `LaguageSwitcher` на signals
- [ ] Убрать `CommonModule` из `CitiesGame` — точечные импорты
- [ ] Убрать `handleError` из `KeyStorageService`
- [ ] Убрать внешний CDN URL — сохранить иконку локально
- [ ] Перенести `validate-branch-name` и `dotenv` в `devDependencies`
- [ ] Заменить `viewChild` таймера на signal input

### Приоритет 3 (желательно)
- [ ] Исправить дублирующий провайдер `Router` в `board.spec.ts`
- [ ] Убрать дублирующий `TuiHeader` в `ProfileSidebar`
- [ ] Исправить `signal<StatsResponseData[] | []>` → `signal<StatsResponseData[]>`
- [ ] Добавить реальные тесты для интерцептора
- [ ] Добавить `isLoading = signal(false)` в Registration
- [ ] Исправить `autocomplete="current-password"` → `"new-password"` в регистрации
- [ ] Исправить опечатку `mismathPassword` в переводах
- [ ] Добавить действие кнопке "Начать" на Main
- [ ] Убрать `console.error` из `decrypto-ai-service.ts`
- [ ] Удалить/подключить `EyeCompassDirective`
- [ ] Убрать лишний `initialValue` в `ProfileSidebar.activeLang`
- [ ] Заменить `getInputError` method binding на `computed()`
- [ ] Удалить избыточный `standalone: true`
- [ ] Исправить `Quiz.wordsToAsk` — убрать `Math.random()` из `computed()`

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
| Angular takeUntilDestroyed | https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed |
| MDN CSP | https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP |
| MDN autocomplete | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete |
| OWASP A02 Cryptographic Failures | https://owasp.org/Top10/A02_2021-Cryptographic_Failures/ |
| Taiga UI Components | https://taiga-ui.dev |
| Transloco | https://jsverse.github.io/transloco |
| Transloco — persist lang | https://jsverse.github.io/transloco/docs/plugins/persist-lang |

---

## История ревью

| Дата | Общая оценка | Критических | Мажорных | Минорных |
|------|-------------|-------------|----------|----------|
| 2026-03-09 | 4.5/10 | 6 | 8 | 9 |
| 2026-03-09 | 4.5/10 | 6 | 8 | 8 |
| 2026-03-16 | 5.5/10 | 2 | 7 | 7 |
| 2026-03-19 | 5.0/10 | 3 | 14 | 11 |
| 2026-03-25 | 5.0/10 | 3 | 18 | 12 |
| 2026-04-09 | 5.0/10 | 4 | 21 | 16 |
