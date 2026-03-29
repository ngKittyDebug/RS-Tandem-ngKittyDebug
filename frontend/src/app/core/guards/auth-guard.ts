import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loginRouterPath = getRoutePath(AppRoute.LOGIN);

  return toObservable(authService.isInitialized).pipe(
    filter((initialized) => initialized),
    take(1),
    map(() => {
      if (authService.isLoggedIn()) return true;
      return router.createUrlTree([loginRouterPath]);
    }),
  );
};
