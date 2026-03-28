import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';
import { map } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const mainRouterPath = getRoutePath(AppRoute.MAIN);

  return authService
    .ensureSession()
    .pipe(map((isLoggedIn) => (isLoggedIn ? router.createUrlTree([mainRouterPath]) : true)));
};
