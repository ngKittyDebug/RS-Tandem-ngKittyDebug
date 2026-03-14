import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Quiz } from './quiz';
import { GameService } from '../../services/game-service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';

const gameServiceMock = {
  activeQuiz: signal({
    groupId: 'test',
    words: [{ id: '1', word: 'test', translation: 'тест' }],
  }),
  questionMode: signal(1),
  getRandomQuestion: (): { question: string; answer: string; keywords: string[] } => ({
    question: 'Что значит test?',
    answer: 'тест',
    keywords: ['тест'],
  }),
  checkAnswer: (): boolean => true,
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
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [
        { provide: GameService, useValue: gameServiceMock },
        {
          provide: Router,
          useValue: {
            navigate: (): void => {
              /* empty */
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Quiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
