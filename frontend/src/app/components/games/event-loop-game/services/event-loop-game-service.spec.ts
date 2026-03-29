import { TestBed } from '@angular/core/testing';

import { EventLoopGameService } from './event-loop-game-service';
import { EMPTY, of } from 'rxjs';
import { EventLoopGameApiService } from './event-loop-game-api-service';
import { EventLoopSessionService } from './event-loop-session-service';
import { UserService } from '../../../../core/services/user/user-service';
import { TranslocoService } from '@jsverse/transloco';

describe('EventLoopGameService', () => {
  let service: EventLoopGameService;

  const apiMock = {
    getTasks: vi.fn(() => of([])),
  };

  const sessionMock = {
    createSession: vi.fn(() => []),
  };

  const userMock = {
    statsUpdate: vi.fn(() => EMPTY),
  };

  const translocoMock = {
    langChanges$: of('ru'),
    getActiveLang: vi.fn(() => 'ru'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventLoopGameService,
        { provide: EventLoopGameApiService, useValue: apiMock },
        { provide: EventLoopSessionService, useValue: sessionMock },
        { provide: UserService, useValue: userMock },
        { provide: TranslocoService, useValue: translocoMock },
      ],
    });
    service = TestBed.inject(EventLoopGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request tasks on loadGame', () => {
    service.loadGame();

    expect(apiMock.getTasks).toHaveBeenCalled();
  });
});
