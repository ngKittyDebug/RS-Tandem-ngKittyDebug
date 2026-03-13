import { Injectable, signal } from '@angular/core';
import { QuizState } from './game-service';
import data from '../mock-data/mock-data.json';
import { Question } from '../models/data.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly mockGroups = data.mockData;
  public readonly activeQuiz = signal<QuizState | null>(null);
  public readonly correctAnswers = signal<number>(0);
  public readonly wrongAnswers = signal<number>(0);

  public reset(): void {
    this.activeQuiz.set(null);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
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
}
