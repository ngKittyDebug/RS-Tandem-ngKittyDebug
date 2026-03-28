import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { guestGuard } from './guest-guard';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';
import { firstValueFrom, Observable, of } from 'rxjs';

describe('guestGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  let authServiceMock: { ensureSession: () => Observable<boolean> };
  let router: Router;

  beforeEach(() => {
    authServiceMock = { ensureSession: (): Observable<boolean> => of(false) };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if user is not logged in', async () => {
    authServiceMock.ensureSession = (): Observable<boolean> => of(false);

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = await firstValueFrom(
      executeGuard(route, state) as Observable<boolean | UrlTree>,
    );

    expect(result).toBe(true);
  });

  it('should redirect to main if user is logged in', async () => {
    authServiceMock.ensureSession = (): Observable<boolean> => of(true);

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const mainPath = getRoutePath(AppRoute.MAIN);

    const result = (await firstValueFrom(
      executeGuard(route, state) as Observable<boolean | UrlTree>,
    )) as UrlTree;

    expect(router.serializeUrl(result)).toBe(router.serializeUrl(router.createUrlTree([mainPath])));
  });
});
