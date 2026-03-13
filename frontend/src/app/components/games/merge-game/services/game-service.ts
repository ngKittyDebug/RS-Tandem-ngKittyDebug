import { inject, Injectable, signal } from '@angular/core';
import { GameMode, PersonalityMode, QuestionMode, StatusGame } from '../models/settings.type';
import data from '../mock-data/mock-data.json';
import { QuizService } from './quiz-service';

export interface QuizState {
  groupId: number;
  theme: string;
  words: string[];
}

export interface GameResult {
  date: string;
  mode: string;
  correctAnswers: number;
  wrongAnswers: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly mockGroups = data.mockData;
  private readonly quizService = inject(QuizService);

  public readonly gameMode = signal<GameMode>('withoutAI');
  public readonly personalityMode = signal<PersonalityMode>('neutral');
  public readonly questionMode = signal<QuestionMode>(1);
  public readonly statusGame = signal<StatusGame>('idle');

  public readonly activeQuiz = signal<QuizState | null>(null);
  public readonly correctAnswers = signal<number>(0);
  public readonly wrongAnswers = signal<number>(0);

  public setGameMode(mode: GameMode): void {
    this.gameMode.set(mode);
  }
  public setPersonalityMode(mode: PersonalityMode): void {
    this.personalityMode.set(mode);
  }
  public setQuestionMode(mode: QuestionMode): void {
    this.questionMode.set(mode);
  }

  public setStatus(status: StatusGame): void {
    this.statusGame.set(status);
  }

  public startGame(): void {
    this.setStatus('playing');
    this.quizService.reset();
  }

  public resetGame(): void {
    this.setStatus('idle');
    this.quizService.reset();
  }

  public finishGame(): void {
    const result: GameResult = {
      date: new Date().toISOString(),
      mode: this.gameMode(),
      correctAnswers: this.quizService.correctAnswers(),
      wrongAnswers: this.quizService.wrongAnswers(),
    };

    const history = JSON.parse(localStorage.getItem('merge-game-history') || '[]');
    history.push(result);
    localStorage.setItem('merge-game-history', JSON.stringify(history));

    this.setStatus('finished');
  }
}
