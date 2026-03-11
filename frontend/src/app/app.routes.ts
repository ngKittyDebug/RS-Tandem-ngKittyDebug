import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export enum AppRoute {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  USER_PROFILE = 'user-profile',
  MAIN = '',
}

export enum GameRoute {
  DECRYPTO = 'decrypto',
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
    path: GameRoute.DECRYPTO,
    loadComponent: () => import('./components/games/decrypto/decrypto').then((m) => m.Decrypto),
    providers: [provideTranslocoScope('decrypto')],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    providers: [provideTranslocoScope('not-found')],
  },
];
