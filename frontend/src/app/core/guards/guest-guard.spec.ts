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

describe('guestGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => guestGuard(...guardParameters));

  let authServiceMock: { isLoggedIn: () => boolean };
  let router: Router;

  beforeEach(() => {
    authServiceMock = { isLoggedIn: (): boolean => false };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if user is not logged in', () => {
    authServiceMock.isLoggedIn = (): boolean => false;

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = executeGuard(route, state);

    expect(result).toBe(true);
  });

  it('should redirect to main if user is logged in', () => {
    authServiceMock.isLoggedIn = (): boolean => true;

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const mainPath = getRoutePath(AppRoute.MAIN);

    const result = executeGuard(route, state) as UrlTree;

    expect(router.serializeUrl(result)).toBe(router.serializeUrl(router.createUrlTree([mainPath])));
  });
});
