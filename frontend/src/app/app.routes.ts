import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/main/main').then((m) => m.Main),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registration',
    loadComponent: () => import('./pages/registration/registration').then((m) => m.Registration),
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
