import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { boardGuard } from './board-guard';
import { GameService } from '../../components/games/merge-game/services/game-service';

describe('boardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => boardGuard(...guardParameters));

  let gameServiceMock: { statusGame: () => string };
  let router: Router;

  beforeEach(() => {
    gameServiceMock = { statusGame: (): string => 'playing' };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: GameService, useValue: gameServiceMock }],
    });

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if state is playing', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = executeGuard(route, state);

    expect(result).toBe(true);
  });

  it('should redirect to settings if state is not playing', () => {
    gameServiceMock.statusGame = (): string => 'idle';

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = executeGuard(route, state) as UrlTree;

    expect(router.serializeUrl(result)).toBe(
      router.serializeUrl(router.createUrlTree(['/merge-game/settings'])),
    );
  });
});
