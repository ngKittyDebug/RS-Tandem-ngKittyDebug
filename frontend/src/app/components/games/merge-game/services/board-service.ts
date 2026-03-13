import { effect, inject, Injectable, signal } from '@angular/core';

import data from '../mock-data/mock-data.json';
import { Row, WordCard } from '../models/data.interface';
import { Router } from '@angular/router';
import { GameService } from './game-service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private router = inject(Router);
  private readonly gameService = inject(GameService);
  private readonly mockGroups = data.mockData;
  private selectGroups = [...this.mockGroups].sort(() => Math.random() - 0.5).slice(0, 6);

  private shuffledCards: WordCard[] = this.selectGroups
    .flatMap((group) =>
      [...group.words]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map((item) => ({ word: item.word, groupId: group.id })),
    )
    .sort(() => Math.random() - 0.5);

  public readonly rows = signal<Row[]>(
    Array.from({ length: 6 }, (_, rowIndex) => ({
      slots: this.shuffledCards.slice(rowIndex * 4, rowIndex * 4 + 4),
      completed: false,
    })),
  );
  constructor() {
    effect(() => {
      if (this.gameService.activeQuiz()) {
        this.router.navigate(['/merge-game/quiz']);
      }
    });
  }

  public initBoard(): void {
    this.selectGroups = [...this.mockGroups].sort(() => Math.random() - 0.5).slice(0, 6);

    this.shuffledCards = this.selectGroups
      .flatMap((group) =>
        [...group.words]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4)
          .map((item) => ({ word: item.word, groupId: group.id })),
      )
      .sort(() => Math.random() - 0.5);

    this.rows.set(
      Array.from({ length: 6 }, (_, rowIndex) => ({
        slots: this.shuffledCards.slice(rowIndex * 4, rowIndex * 4 + 4),
        completed: false,
      })),
    );
  }

  private openQuiz(groupId: number, words: string[]): void {
    const group = this.selectGroups.find((g) => g.id === groupId)!;
    this.gameService.activeQuiz.set({ groupId, theme: group.category, words });
  }

  public checkRow(rows: Row[], rowIndex: number): void {
    const row = rows[rowIndex];
    if (row.completed) return;

    const slots = row.slots;
    if (slots.some((slot) => slot === null)) return;

    const firstGroupId = slots[0]!.groupId;
    const isComplete = slots.every((slot) => slot!.groupId === firstGroupId);

    if (isComplete) {
      const group = this.selectGroups.find((g) => g.id === firstGroupId)!;
      const words = slots.map((s) => s!.word);
      rows[rowIndex] = { ...row, completed: true, theme: group.category };
      this.openQuiz(firstGroupId, words);
    }
  }
}
