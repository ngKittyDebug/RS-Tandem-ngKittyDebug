import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loginRouterPath = getRoutePath(AppRoute.LOGIN);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree([loginRouterPath]);
};
