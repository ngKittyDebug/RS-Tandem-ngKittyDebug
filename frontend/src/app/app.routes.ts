import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export enum AppRoute {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  USER_PROFILE = 'user-profile',
  MAIN = '',
  MERGE_GAME = 'merge-game',
}

export const getRoutePath = (route: AppRoute): `/${AppRoute}` => {
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
  },
  {
    path: AppRoute.REGISTRATION,
    loadComponent: () => import('./pages/registration/registration').then((m) => m.Registration),
    providers: [provideTranslocoScope('registration')],
  },
  {
    path: AppRoute.USER_PROFILE,
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
    providers: [provideTranslocoScope('user-profile')],
  },
  {
    path: AppRoute.MERGE_GAME,
    loadComponent: () =>
      import('./components/games/merge-game/merge-game').then((m) => m.MergeGame),
    providers: [provideTranslocoScope('merge-game')],
    children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },

      {
        path: 'settings',
        loadComponent: () =>
          import('./components/games/merge-game/components/settings/settings').then(
            (m) => m.Settings,
          ),
        providers: [provideTranslocoScope('merge-game')],
      },

      {
        path: 'theory',
        loadComponent: () =>
          import('./components/games/merge-game/components/theory/theory').then((m) => m.Theory),
        providers: [provideTranslocoScope('merge-game')],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    providers: [provideTranslocoScope('not-found')],
  },
];
