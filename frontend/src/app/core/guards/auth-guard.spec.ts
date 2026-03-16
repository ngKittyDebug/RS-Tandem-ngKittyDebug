import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../app.routes';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authServiceMock: { isLoggedIn: () => boolean };
  let router: Router;

  beforeEach(() => {
    authServiceMock = { isLoggedIn: (): boolean => true };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if user is logged in', () => {
    authServiceMock.isLoggedIn = (): boolean => true;

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = executeGuard(route, state);

    expect(result).toBe(true);
  });

  it('should redirect to login if user is not logged in', () => {
    authServiceMock.isLoggedIn = (): boolean => false;

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const loginPath = getRoutePath(AppRoute.LOGIN);

    const result = executeGuard(route, state) as UrlTree;

    expect(router.serializeUrl(result)).toBe(
      router.serializeUrl(router.createUrlTree([loginPath])),
    );
  });
});
