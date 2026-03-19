import { inject, Injectable, signal } from '@angular/core';
import { GameMode, PersonalityMode, QuestionMode, StatusGame } from '../models/settings.type';
import { QuizService } from './quiz-service';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/constants/api.constants';
import { GameResult, QuizState, ResponseData } from '../models/data.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private http = inject(HttpClient);

  private readonly quizService = inject(QuizService);

  public readonly gameMode = signal<GameMode>('withoutAI');
  public readonly personalityMode = signal<PersonalityMode>('neutral');
  public readonly questionMode = signal<QuestionMode>(1);
  public readonly statusGame = signal<StatusGame>('idle');

  public readonly activeQuiz = signal<QuizState | null>(null);
  public readonly correctAnswers = signal<number>(0);
  public readonly wrongAnswers = signal<number>(0);
  public readonly lastResult = signal<GameResult | null>(null);

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

    this.lastResult.set(result);
    this.setStatus('finished');
  }

  public getAllCards(): Observable<ResponseData> {
    return this.http.get<ResponseData>(`${API_BASE_URL}/data`).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
