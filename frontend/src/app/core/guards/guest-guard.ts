import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const mainRouterPath = getRoutePath(AppRoute.MAIN);
  const loggedIn = authService.isLoggedIn();

  console.log('[OAuth-Debug] guestGuard check: isLoggedIn =', loggedIn);

  if (!loggedIn) {
    return true;
  }

  console.log('[OAuth-Debug] guestGuard: redirecting to', mainRouterPath);
  return router.createUrlTree([mainRouterPath]);
};
