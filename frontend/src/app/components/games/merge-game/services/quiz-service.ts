import { Injectable, signal } from '@angular/core';
import { Question, QuizState } from '../models/data.interface';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  public readonly activeQuiz = signal<QuizState | null>(null);
  public readonly correctAnswers = signal<number>(0);
  public readonly wrongAnswers = signal<number>(0);

  public reset(): void {
    this.activeQuiz.set(null);
    this.correctAnswers.set(0);
    this.wrongAnswers.set(0);
  }

  public getRandomQuestion(word: string): Question | null {
    const quiz = this.activeQuiz();
    if (!quiz) return null;
    const questions = quiz.questions.filter(() => quiz.words.includes(word));
    if (!questions.length) return null;
    return questions[Math.floor(Math.random() * questions.length)];
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
