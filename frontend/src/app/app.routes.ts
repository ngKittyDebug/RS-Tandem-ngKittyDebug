import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { guestGuard } from './core/guards/guest-guard';
import { authGuard } from './core/guards/auth-guard';

export enum AppRoute {
  REGISTRATION = 'registration',
  LOGIN = 'login',
  USER_PROFILE = 'user-profile',
  MAIN = '',
}

export const getRoutePath = <T extends AppRoute>(route: T): `/${T}` => {
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
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    providers: [provideTranslocoScope('not-found')],
  },
];
