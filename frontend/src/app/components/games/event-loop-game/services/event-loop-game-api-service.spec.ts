import { TestBed } from '@angular/core/testing';

import { EventLoopGameApiService } from './event-loop-game-api-service';
import { of } from 'rxjs';
import { KeyStorageService } from '../../../../core/services/key-storage/key-storage-service';

describe('EventLoopGameApiService', () => {
  let service: EventLoopGameApiService;

  const keyStorageMock = {
    getData: vi.fn(() =>
      of({
        storage: {
          tasks: [
            {
              id: 1,
              difficulty: 'easy',
              code: 'console.log(1)',
              output: ['1'],
              hint: { en: 'hint', ru: 'подсказка' },
              executionSteps: [],
            },
          ],
        },
      }),
    ),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventLoopGameApiService,
        { provide: KeyStorageService, useValue: keyStorageMock },
      ],
    });
    service = TestBed.inject(EventLoopGameApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return tasks from storage', () => {
    service.getTasks().subscribe((result) => {
      expect(keyStorageMock.getData).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].difficulty).toBe('easy');
    });
  });
});
