import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  GuardResult,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

import { guestGuard } from './guest-guard';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';

describe('guestGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  let authServiceMock: {
    isInitialized: ReturnType<typeof signal<boolean>>;
    isLoggedIn: ReturnType<typeof signal<boolean>>;
  };
  let router: Router;

  beforeEach(() => {
    authServiceMock = {
      isInitialized: signal(true),
      isLoggedIn: signal(false),
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if user is not logged in', async () => {
    authServiceMock.isLoggedIn.set(false);

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = await firstValueFrom(executeGuard(route, state) as Observable<GuardResult>);

    expect(result).toBe(true);
  });

  it('should redirect to main if user is logged in', async () => {
    authServiceMock.isLoggedIn.set(true);

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const mainPath = getRoutePath(AppRoute.MAIN);

    const result = (await firstValueFrom(
      executeGuard(route, state) as Observable<GuardResult>,
    )) as UrlTree;

    expect(router.serializeUrl(result)).toBe(router.serializeUrl(router.createUrlTree([mainPath])));
  });
});
