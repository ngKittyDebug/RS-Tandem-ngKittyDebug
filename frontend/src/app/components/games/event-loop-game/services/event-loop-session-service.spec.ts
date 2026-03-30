import { TestBed } from '@angular/core/testing';

import { EventLoopSessionService } from './event-loop-session-service';
import { Difficulty } from '../models/task.enum';
import { Task } from '../models/task.interface';

describe('EventLoopSessionService', () => {
  let service: EventLoopSessionService;

  const createTask = (id: number, difficulty: Difficulty): Task => ({
    id,
    difficulty,
    code: `code-${id}`,
    output: [`output-${id}`],
    hint: {
      en: `hint-${id}`,
      ru: `подсказка-${id}`,
    },
    executionSteps: [],
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventLoopSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create session with provided count per difficulty', () => {
    const tasks: Task[] = [
      createTask(1, Difficulty.EASY),
      createTask(2, Difficulty.EASY),
      createTask(3, Difficulty.MEDIUM),
      createTask(4, Difficulty.MEDIUM),
      createTask(5, Difficulty.HARD),
      createTask(6, Difficulty.HARD),
    ];

    const result = service.createSession(tasks, 1);

    expect(result).toHaveLength(3);
    expect(result[0].difficulty).toBe(Difficulty.EASY);
    expect(result[1].difficulty).toBe(Difficulty.MEDIUM);
    expect(result[2].difficulty).toBe(Difficulty.HARD);
  });
});
