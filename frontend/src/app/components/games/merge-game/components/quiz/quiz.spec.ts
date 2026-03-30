import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Quiz } from './quiz';
import { GameService } from '../../services/game-service';
import { QuizService } from '../../services/quiz-service';
import { BoardService } from '../../services/board-service';
import { AiService } from '../../services/ai-service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Row } from '../../models/data.interface';

const quizServiceMock = {
  activeQuiz: signal({
    groupId: 1,
    theme: 'Методы массива',
    words: ['map', 'filter'],
    questions: [
      {
        question: 'Что делает map?',
        answer: 'Трансформирует массив',
        keywords: ['трансформирует'],
      },
    ],
  }),
  correctAnswers: signal(0),
  wrongAnswers: signal(0),
  getRandomQuestion: (): {
    question: string;
    answer: string;
    keywords: string[];
  } => ({
    question: 'Что делает map?',
    answer: 'Трансформирует массив',
    keywords: ['трансформирует'],
  }),
  checkAnswer: (): boolean => true,
  submitAnswer: (): void => {
    /* empty */
  },
  reset: (): void => {
    /* empty */
  },
};

const gameServiceMock = {
  gameMode: signal('withoutAI'),
  questionMode: signal(1),
  personalityMode: signal('neutral'),
  finishGame: (): void => {
    /* empty */
  },
};

const boardServiceMock = {
  allRowsCompleted: signal(false),
  rows: signal<Row[]>([]),
};

const aiServiceMock = {
  checkAnswerAi: (): void => {
    /* empty */
  },
};

const routerMock = {
  navigate: vi.fn(),
};

describe('Quiz', () => {
  let component: Quiz;
  let fixture: ComponentFixture<Quiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Quiz,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
      providers: [
        { provide: GameService, useValue: gameServiceMock },
        { provide: QuizService, useValue: quizServiceMock },
        { provide: BoardService, useValue: boardServiceMock },
        { provide: AiService, useValue: aiServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Quiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render progress', () => {
    const progress = fixture.nativeElement.querySelector('.quiz__progress');
    expect(progress.textContent).toContain('1 /');
  });

  it('should render question', () => {
    const question = fixture.nativeElement.querySelector('.quiz__question');
    expect(question.textContent).toContain('Что делает map?');
  });

  it('should render textarea when answer not shown', () => {
    const textarea = fixture.nativeElement.querySelector('.quiz__input');
    expect(textarea).toBeTruthy();
  });

  it('should disable submit button when answer is empty', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should show result after submit', () => {
    component['userAnswer'].set('трансформирует');
    component['onSubmit']();
    fixture.detectChanges();

    const result = fixture.nativeElement.querySelector('.quiz__result');
    expect(result).toBeTruthy();
  });

  it('should show correct answer after submit', () => {
    component['userAnswer'].set('трансформирует');
    component['onSubmit']();
    fixture.detectChanges();

    const answer = fixture.nativeElement.querySelector('.quiz__answer-text');
    expect(answer.textContent).toContain('Трансформирует массив');
  });

  it('should show next button after submit', () => {
    component['userAnswer'].set('трансформирует');
    component['onSubmit']();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.quiz__footer button');
    expect(button).toBeTruthy();
  });
});
