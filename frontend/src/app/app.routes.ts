import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
    providers: [provideTranslocoScope('main')],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    providers: [provideTranslocoScope('login')],
  },
  {
    path: 'registration',
    loadComponent: () => import('./pages/registration/registration').then((m) => m.Registration),
    providers: [provideTranslocoScope('registration')],
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
    providers: [provideTranslocoScope('user-profile')],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    providers: [provideTranslocoScope('not-found')],
  },
];
