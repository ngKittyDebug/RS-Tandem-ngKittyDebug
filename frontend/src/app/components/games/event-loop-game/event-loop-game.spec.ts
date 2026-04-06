import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLoopGame } from './event-loop-game';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { signal } from '@angular/core';
import { EventLoopGameService } from './services/event-loop-game-service';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { of } from 'rxjs';

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
    vi.clearAllMocks();
    dialogsMock.open.mockReset();
    dialogsMock.open.mockReturnValue(of(false));

    gameMock.isLoading.set(false);
    gameMock.isStarted.set(false);
    gameMock.isChecking.set(false);
    gameMock.gameStatus.set('idle');
    gameMock.currentTaskIndex.set(1);
    gameMock.totalTasks.set(2);
    gameMock.difficulty.set('easy');
    gameMock.codeSnippet.set('console.log(1)');
    gameMock.hint.set('hint text');
    gameMock.lives.set(3);
    gameMock.lifeItems.set([
      { id: 1, isActive: true },
      { id: 2, isActive: true },
      { id: 3, isActive: true },
    ]);
    gameMock.progressItems.set(['current', 'upcoming']);
    gameMock.userAnswer.set([
      { id: '1', value: 'sync', status: 'idle' },
      { id: '2', value: 'micro', status: 'idle' },
    ]);
    gameMock.isDragDisabled.set(false);

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
        provideHighlightOptions({
          coreLibraryLoader: () => import('highlight.js/lib/core'),
          lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
          languages: {
            typescript: () => import('highlight.js/lib/languages/typescript'),
          },
        }),
        { provide: Router, useValue: routerMock },
        { provide: TuiDialogService, useValue: dialogsMock },
        { provide: EventLoopGameService, useValue: gameMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventLoopGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function setStartedState(): void {
    gameMock.isLoading.set(false);
    gameMock.isStarted.set(true);
    gameMock.isChecking.set(false);
    gameMock.gameStatus.set('idle');
  }

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

  it('should cover start navigation button click from template', () => {
    gameMock.isLoading.set(false);
    gameMock.isStarted.set(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.nav button');
    buttons[0].click();

    expect(gameMock.reset).toHaveBeenCalled();
  });

  it('should cover main navigation button click from template', () => {
    gameMock.isLoading.set(false);
    gameMock.isStarted.set(false);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.nav button');
    buttons[1].click();

    expect(routerMock.navigate).toHaveBeenCalled();
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

  it('should call checkAnswer when action button is clicked in idle state', () => {
    setStartedState();
    gameMock.gameStatus.set('idle');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const actionButton = el.querySelector('.game-header__button_action') as HTMLButtonElement;

    actionButton.click();

    expect(gameMock.checkAnswer).toHaveBeenCalled();
  });

  it('should call nextTask when action button is clicked in correct state', () => {
    setStartedState();
    gameMock.gameStatus.set('correct');
    component['isHintOpen'].set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const actionButton = el.querySelector('.game-header__button_action') as HTMLButtonElement;

    expect(actionButton.classList.contains('game-header__button_next')).toBe(true);

    actionButton.click();

    expect(gameMock.nextTask).toHaveBeenCalled();
    expect(component['isHintOpen']()).toBe(false);
  });

  it('should render correct and incorrect answer states', () => {
    gameMock.isLoading.set(false);
    gameMock.isStarted.set(true);
    gameMock.userAnswer.set([
      { id: '1', value: 'sync', status: 'correct' },
      { id: '2', value: 'timeout', status: 'incorrect' },
    ]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.sortable-item_correct')).toBeTruthy();
    expect(el.querySelector('.sortable-item_incorrect')).toBeTruthy();
    expect(el.querySelectorAll('.sortable-item__icon')).toHaveLength(2);
  });

  it('should toggle hint from template button', () => {
    setStartedState();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const hintButton = el.querySelector('.game-header__button') as HTMLButtonElement;

    hintButton.click();
    fixture.detectChanges();

    expect(component['isHintOpen']()).toBe(true);
    expect(
      el.querySelector('.game-hint-container')?.classList.contains('game-hint-container_active'),
    ).toBe(true);
    expect(el.querySelector('.game-hint')?.textContent).toContain('hint text');
  });

  it('should restart game and close hint/dialog on restart', () => {
    component['isHintOpen'].set(true);
    component['isEndDialogOpen'].set(true);

    component['onRestart']();

    expect(component['isHintOpen']()).toBe(false);
    expect(component['isEndDialogOpen']()).toBe(false);
    expect(gameMock.start).toHaveBeenCalled();
  });

  it('should disable action button while checking', () => {
    setStartedState();
    gameMock.isChecking.set(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const actionButton = el.querySelector('.game-header__button_action') as HTMLButtonElement;

    expect(actionButton.disabled).toBe(true);
  });
});
