import { TestBed } from '@angular/core/testing';

import { EventLoopSessionService } from './event-loop-session-service';

describe('EventLoopSessionService', () => {
  let service: EventLoopSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventLoopSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
