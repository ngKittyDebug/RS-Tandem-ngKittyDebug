import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';
import { catchError, filter, Observable, of, switchMap, take, throwError } from 'rxjs';
import { AUTH_PATHS } from './models/auth-path.enum';
import { CLOUDINARY_API_HOST } from '../cloudinary/models/cloudinary.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isCloudinaryRequest = req.url.includes(CLOUDINARY_API_HOST);

  if (isCloudinaryRequest) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        if (req.url.endsWith(AUTH_PATHS.REFRESH)) {
          return authService.logout().pipe(
            catchError(() => of(void 0)),
            switchMap(() => throwError(() => err)),
          );
        }
        return handle401(req, next, authService);
      }

      return throwError(() => err);
    }),
  );
};

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
): Observable<HttpEvent<unknown>> {
  if (!authService.isRefreshing) {
    authService.isRefreshing = true;
    authService.refreshSubject.next(null);

    return authService.refresh().pipe(
      switchMap(() => {
        authService.isRefreshing = false;
        const newToken = authService.getAccessToken();

        if (!newToken) {
          return throwError(() => new Error('Token is null after refresh'));
        }

        authService.refreshSubject.next(newToken);

        const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
        return next(retryReq);
      }),
      catchError((refreshErr) => {
        authService.isRefreshing = false;
        return authService.logout().pipe(
          catchError(() => of(void 0)),
          switchMap(() => throwError(() => refreshErr)),
        );
      }),
    );
  }

  return authService.refreshSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((newToken) => {
      const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken!}` } });
      return next(retryReq);
    }),
  );
}
