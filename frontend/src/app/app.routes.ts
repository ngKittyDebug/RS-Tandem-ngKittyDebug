import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { quizGuard } from './core/guards/quiz-guard';
import { boardGuard } from './core/guards/board-guard';
import { guestGuard } from './core/guards/guest-guard';
import { authGuard } from './core/guards/auth-guard';

export enum AppRoute {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  USER_PROFILE = 'user-profile',
  MAIN = '',
}

export enum GameRoute {
  DECRYPTO = 'decrypto',
  MERGE_GAME = 'merge-game',
  HANGMAN = 'hangman',
  WORD_CHAIN = 'word-chain',
  LOOP = 'meowloop',
}

export enum MergeGameRoute {
  SETTINGS = 'settings',
  BOARD = 'board',
  QUIZ = 'quiz',
  THEORY = 'theory',
}

export const getRoutePath = <T extends AppRoute | GameRoute>(route: T): `/${T}` => {
  return `/${route}`;
};

export const routes: Routes = [
  {
    path: AppRoute.MAIN,
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
    providers: [provideTranslocoScope('main')],
  },
  {
    path: AppRoute.LOGIN,
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    providers: [provideTranslocoScope('login')],
    canActivate: [guestGuard],
  },
  {
    path: AppRoute.REGISTRATION,
    loadComponent: () => import('./pages/registration/registration').then((m) => m.Registration),
    providers: [provideTranslocoScope('registration')],
    canActivate: [guestGuard],
  },
  {
    path: AppRoute.USER_PROFILE,
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
    providers: [provideTranslocoScope('user-profile')],
    canActivate: [authGuard],
  },
  {
    path: GameRoute.DECRYPTO,
    loadComponent: () => import('./components/games/decrypto/decrypto').then((m) => m.Decrypto),
    providers: [provideTranslocoScope('decrypto')],
    canActivate: [authGuard],
  },

  {
    path: GameRoute.MERGE_GAME,
    loadComponent: () =>
      import('./components/games/merge-game/merge-game').then((m) => m.MergeGame),
    providers: [provideTranslocoScope('merge-game')],
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: MergeGameRoute.SETTINGS, pathMatch: 'full' },

      {
        path: MergeGameRoute.SETTINGS,
        loadComponent: () =>
          import('./components/games/merge-game/components/settings/settings').then(
            (m) => m.Settings,
          ),
      },

      {
        path: MergeGameRoute.BOARD,
        loadComponent: () =>
          import('./components/games/merge-game/components/board/board').then((m) => m.Board),
        canActivate: [boardGuard],
      },

      {
        path: MergeGameRoute.QUIZ,
        loadComponent: () =>
          import('./components/games/merge-game/components/quiz/quiz').then((m) => m.Quiz),
        canActivate: [quizGuard],
      },

      {
        path: MergeGameRoute.THEORY,
        loadComponent: () =>
          import('./components/games/merge-game/components/theory/theory').then((m) => m.Theory),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    providers: [provideTranslocoScope('not-found')],
  },
];
