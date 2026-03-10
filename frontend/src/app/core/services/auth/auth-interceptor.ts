import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { AUTH_PATHS } from './models/auth-path.enum';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        if (req.url.includes(AUTH_PATHS.REFRESH)) {
          authService
            .logout()
            .pipe(catchError(() => of(void 0)))
            .subscribe();
          return throwError(() => err);
        }
        return authService.refresh().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken!}` } });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            authService
              .logout()
              .pipe(catchError(() => of(void 0)))
              .subscribe();
            return throwError(() => refreshErr);
          }),
        );
      }

      return throwError(() => err);
    }),
  );
};
