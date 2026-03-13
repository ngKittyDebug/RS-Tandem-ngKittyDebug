import { inject, Injectable, signal } from '@angular/core';

import data from '../mock-data/mock-data.json';
import { Row } from '../models/data.interface';
import { QuizService } from './quiz-service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly quizService = inject(QuizService);
  private readonly mockGroups = data.mockData;

  private selectGroups: (typeof this.mockGroups)[number][] = [];
  public readonly rows = signal<Row[]>([]);

  public initBoard(): void {
    this.selectGroups = [...this.mockGroups].sort(() => Math.random() - 0.5).slice(0, 6);

    const shuffledCards = this.selectGroups
      .flatMap((group) =>
        [...group.words]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4)
          .map((item) => ({ word: item.word, groupId: group.id })),
      )
      .sort(() => Math.random() - 0.5);

    this.rows.set(
      Array.from({ length: 6 }, (_, rowIndex) => ({
        slots: shuffledCards.slice(rowIndex * 4, rowIndex * 4 + 4),
        completed: false,
      })),
    );
  }

  private startQuiz(groupId: number, words: string[]): void {
    const group = this.selectGroups.find((g) => g.id === groupId)!;
    this.quizService.activeQuiz.set({ groupId, theme: group.category, words });
  }

  public checkRow(rows: Row[], rowIndex: number): Row[] {
    const row = rows[rowIndex];
    if (row.completed) return rows;
    const slots = row.slots;
    if (slots.some((slot) => slot === null)) return rows;

    const firstGroupId = slots[0]!.groupId;
    const isComplete = slots.every((slot) => slot!.groupId === firstGroupId);

    if (isComplete) {
      const group = this.selectGroups.find((g) => g.id === firstGroupId)!;
      const words = slots.map((s) => s!.word);
      const newRows = [...rows];
      newRows[rowIndex] = { ...row, completed: true, theme: group.category };
      this.startQuiz(firstGroupId, words);
      return newRows;
    }

    return rows;
  }
}
