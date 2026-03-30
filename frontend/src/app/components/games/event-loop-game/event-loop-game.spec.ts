import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLoopGame } from './event-loop-game';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { signal } from '@angular/core';
import { EventLoopGameService } from './services/event-loop-game-service';

describe('EventLoopGame', () => {
  let component: EventLoopGame;
  let fixture: ComponentFixture<EventLoopGame>;

  const gameMock = {
    loadGame: vi.fn(),
    start: vi.fn(),
    reset: vi.fn(),
    reorderAnswer: vi.fn(),
    checkAnswer: vi.fn(),
    nextTask: vi.fn(),
    stopChecking: vi.fn(),

    isLoading: signal(false),
    isStarted: signal(false),
    isChecking: signal(false),
    gameStatus: signal('idle'),
    currentTaskIndex: signal(1),
    totalTasks: signal(2),
    difficulty: signal('easy'),
    codeSnippet: signal('console.log(1)'),
    hint: signal('hint text'),
    lives: signal(3),
    lifeItems: signal([
      { id: 1, isActive: true },
      { id: 2, isActive: true },
      { id: 3, isActive: true },
    ]),
    progressItems: signal(['current', 'upcoming']),
    userAnswer: signal([
      { id: '1', value: 'sync', status: 'idle' },
      { id: '2', value: 'micro', status: 'idle' },
    ]),
    isDragDisabled: signal(false),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  const dialogsMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EventLoopGame,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: TuiDialogService, useValue: dialogsMock },
        { provide: EventLoopGameService, useValue: gameMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventLoopGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadGame on init', () => {
    fixture.detectChanges();

    expect(gameMock.loadGame).toHaveBeenCalled();
  });

  it('should call start on startGame', () => {
    component['startGame']();

    expect(gameMock.start).toHaveBeenCalled();
  });

  it('should reorder answers on drop', () => {
    component['drop']({ previousIndex: 0, currentIndex: 1 } as never);

    expect(gameMock.reorderAnswer).toHaveBeenCalledWith(0, 1);
  });

  it('should open win dialog when game status becomes finished', () => {
    gameMock.gameStatus.set('finished');
    fixture.detectChanges();

    expect(component['isEndDialogOpen']()).toBe(true);
    expect(component['endMode']()).toBe('win');
  });

  it('should open lose dialog when game status becomes failed', () => {
    gameMock.gameStatus.set('failed');
    fixture.detectChanges();

    expect(component['isEndDialogOpen']()).toBe(true);
    expect(component['endMode']()).toBe('lose');
  });

  it('should render loader when game is loading', () => {
    gameMock.isLoading.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
  });

  it('should render start dialog when game is not started', () => {
    gameMock.isLoading.set(false);
    gameMock.isStarted.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-game-start-dialog')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.game-wrapper')).toBeNull();
  });

  it('should stop checking before navigating to main', () => {
    gameMock.isChecking.set(true);
    gameMock.isStarted.set(false);

    component['goToMain']();

    expect(gameMock.stopChecking).toHaveBeenCalled();
  });
});
