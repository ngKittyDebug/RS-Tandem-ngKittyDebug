import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const mainRouterPath = getRoutePath(AppRoute.MAIN);

  if (!authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree([mainRouterPath]);
};
