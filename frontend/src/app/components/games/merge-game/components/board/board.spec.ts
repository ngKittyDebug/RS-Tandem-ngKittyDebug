import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Board } from './board';
import { BoardService } from '../../services/board-service';
import { GameService } from '../../services/game-service';
import { QuizService } from '../../services/quiz-service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Row } from '../../models/data.interface';

const mockRows = signal<Row[]>([
  {
    slots: [
      { word: 'map', groupId: 1 },
      { word: 'filter', groupId: 1 },
      { word: 'reduce', groupId: 1 },
      { word: 'find', groupId: 1 },
    ],
    completed: false,
  },
  { slots: [], completed: true, theme: 'Методы массива' },
]);

const boardServiceMock = {
  rows: mockRows,
  allRowsCompleted: signal(false),
  checkRow: (rows: Row[]): Row[] => rows,
};

const gameServiceMock = {
  statusGame: signal('idle'),
  lastResult: signal(null),
  resetGame: (): void => {
    /* empty */
  },
};

const quizServiceMock = {
  activeQuiz: signal(null),
};

const routerMock = {
  navigate: (): void => {
    /* empty */
  },
};

describe('Board', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Board,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
      providers: [
        { provide: BoardService, useValue: boardServiceMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: QuizService, useValue: quizServiceMock },
        {
          provide: Router,
          useValue: {
            navigate: (): void => {
              /* empty */
            },
          },
        },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 slots for incomplete row', () => {
    const slots = fixture.nativeElement.querySelectorAll('.board__slot');
    expect(slots.length).toBe(4);
  });

  it('should render completed row with theme', () => {
    const theme = fixture.nativeElement.querySelector('.board__row-theme');
    expect(theme.textContent).toContain('Методы массива');
  });

  it('should render word in card', () => {
    const card = fixture.nativeElement.querySelector('.board__card span');
    expect(card.textContent).toContain('map');
  });

  it('should call resetGame and navigate to settings on restart', () => {
    const resetSpy = vi.spyOn(gameServiceMock, 'resetGame');
    const navigateSpy = vi.spyOn(routerMock, 'navigate');

    component['onRestart']();

    expect(resetSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/merge-game/settings']);
  });
});
