import { Injectable, signal } from '@angular/core';
import { GameMode, PersonalityMode, QuestionMode, StatusGame } from '../models/settings.type';
import data from '../mock-data/mock-data.json';
import { Question } from '../models/data.interface';

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
  // private readonly aiService = inject(AiService);

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
    this.activeQuiz.set(null);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
  }

  public resetGame(): void {
    this.setStatus('idle');
    this.activeQuiz.set(null);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
  }
  public finishGame(): void {
    const result: GameResult = {
      date: new Date().toISOString(),
      mode: this.gameMode(),
      correctAnswers: this.correctAnswers(),
      wrongAnswers: this.wrongAnswers(),
    };

    const history = JSON.parse(localStorage.getItem('merge-game-history') || '[]');
    history.push(result);
    localStorage.setItem('merge-game-history', JSON.stringify(history));

    this.setStatus('finished');
  }

  public getRandomQuestion(groupId: number, word: string): Question | null {
    const group = this.mockGroups.find((g) => g.id === groupId);
    const item = group?.words.find((i) => i.word === word);
    if (!item) return null;

    const randomIndex = Math.floor(Math.random() * item.questions.length);
    return item.questions[randomIndex] as Question;
  }

  public checkAnswer(userAnswer: string, keywords: string[]): boolean {
    const normalized = userAnswer.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
  }

  public submitAnswer(isCorrect: boolean): void {
    if (isCorrect) {
      this.correctAnswers.update((v) => v + 1);
    } else {
      this.wrongAnswers.update((v) => v + 1);
    }
  }

  // public async checkAnswerAi(
  //   userAnswer: string,
  //   question: string,
  //   referenceAnswer: string,
  // ): Promise<{ isCorrect: boolean; feedback: string }> {
  //   return this.aiService.checkAnswer(
  //     userAnswer,
  //     question,
  //     referenceAnswer,
  //     this.selectedPersonality(),
  //   );
  // }

  public reset(): void {
    this.setStatus('idle');
  }
}
