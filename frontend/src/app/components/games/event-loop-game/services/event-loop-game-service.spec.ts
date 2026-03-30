import { TestBed } from '@angular/core/testing';

import { EventLoopGameService } from './event-loop-game-service';
import { EMPTY, of } from 'rxjs';
import { EventLoopGameApiService } from './event-loop-game-api-service';
import { EventLoopSessionService } from './event-loop-session-service';
import { UserService } from '../../../../core/services/user/user-service';
import { TranslocoService } from '@jsverse/transloco';
import { Difficulty } from '../models/task.enum';
import { Task } from '../models/task.interface';
import { GameStatus } from '../models/task.const';

describe('EventLoopGameService', () => {
  let service: EventLoopGameService;

  const createTask = (id: number, difficulty: Difficulty, output: string[]): Task => ({
    id,
    difficulty,
    code: `code-${id}`,
    output,
    hint: {
      en: `hint-en-${id}`,
      ru: `hint-ru-${id}`,
    },
    executionSteps: [],
  });

  const tasks = [
    createTask(1, Difficulty.EASY, ['sync', 'micro']),
    createTask(2, Difficulty.MEDIUM, ['a', 'b']),
  ];

  const apiMock = {
    getTasks: vi.fn(() => of(tasks)),
  };

  const sessionMock = {
    createSession: vi.fn(() => tasks),
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
    expect(service.isLoading()).toBe(false);
  });

  it('should start game and create session', () => {
    service.loadGame();
    service.start();

    expect(service.isStarted()).toBe(true);
    expect(sessionMock.createSession).toHaveBeenCalledWith(tasks, 2);
    expect(userMock.statsUpdate).toHaveBeenCalled();
    expect(service.totalTasks()).toBe(2);
    expect(service.currentTaskIndex()).toBe(1);
    expect(service.lives()).toBe(3);
  });

  it('should reset game state', () => {
    service.loadGame();
    service.start();

    service.reset();

    expect(service.isStarted()).toBe(false);
    expect(service.gameStatus()).toBe(GameStatus.Idle);
    expect(service.lives()).toBe(3);
    expect(service.totalTasks()).toBe(0);
    expect(service.userAnswer()).toEqual([]);
  });

  it('should reorder answers and reset answer statuses', () => {
    service.userAnswer.set([
      { id: '1', value: 'a', status: 'correct' },
      { id: '2', value: 'b', status: 'incorrect' },
    ]);
    service.gameStatus.set(GameStatus.Incorrect);

    service.reorderAnswer(0, 1);

    expect(service.userAnswer()).toEqual([
      { id: '2', value: 'b', status: 'idle' },
      { id: '1', value: 'a', status: 'idle' },
    ]);
    expect(service.gameStatus()).toBe(GameStatus.Idle);
  });

  it('should move to next task', () => {
    service.loadGame();
    service.start();

    service.nextTask();

    expect(service.currentTaskIndex()).toBe(2);
    expect(service.gameStatus()).toBe(GameStatus.Idle);
    expect(service.difficulty()).toBe(tasks[1].difficulty);
  });
});
