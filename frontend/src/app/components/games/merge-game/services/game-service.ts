import { Injectable, signal } from '@angular/core';
import { GameMode, PersonalityMode, QuestionMode, StatusGame } from '../models/settings.type';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  public readonly gameMode = signal<GameMode>('no');
  public readonly personalityMode = signal<PersonalityMode>('neutral');
  public readonly questionMode = signal<QuestionMode>(1);
  public readonly statusGame = signal<StatusGame>('idle');

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

  public reset(): void {
    this.setStatus('idle');
  }
}
