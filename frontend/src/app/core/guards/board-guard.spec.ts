import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { boardGuard } from './board-guard';

describe('boardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => boardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
