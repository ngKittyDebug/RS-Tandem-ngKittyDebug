import { Injectable, signal } from '@angular/core';

import data from '../mock-data/mock-data.json';
import { Data, Row, WordCard } from '../models/data.interface';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly mockData = data.mockData;
  private selectedGroups: Data[] = [];
  public readonly rows = signal<Row[]>([]);

  // constructor() {
  //   effect(() => {
  //     if (this.gameService.activeQuiz()) {
  //       this.router.navigate(['/merge-game/quiz']);
  //     }
  //   });
  // }

  public initBoard(): void {
    this.selectedGroups = this.pickRandom(this.mockData, 6);

    const cards: WordCard[] = this.selectedGroups
      .flatMap((g) =>
        this.pickRandom(g.words, 4).map((item) => ({ word: item.word, groupId: g.id })),
      )
      .sort(() => Math.random() - 0.5);

    this.rows.set(
      Array.from({ length: 6 }, (_, i) => ({
        slots: cards.slice(i * 4, i * 4 + 4),
        completed: false,
      })),
    );
  }

  public swapCards(fromRow: number, fromSlot: number, toRow: number, toSlot: number): void {
    this.rows.update((rows) => {
      const newRows = rows.map((row) => ({ ...row, slots: [...row.slots] }));
      newRows[toRow].slots[toSlot] = rows[fromRow].slots[fromSlot];
      newRows[fromRow].slots[fromSlot] = rows[toRow].slots[toSlot];
      return newRows;
    });

    this.checkRow(toRow);
    this.checkRow(fromRow);
  }

  // // вызывается внутри checkRow когда isComplete
  // private openQuiz(groupId: number, words: string[]): void {
  //   const group = this.selectGroups.find((g) => g.id === groupId)!;
  //   this.gameService.activeQuiz.set({ groupId, theme: group.theme, words });
  // }

  private checkRow(rowIndex: number): void {
    const row = this.rows()[rowIndex];
    if (row.completed || row.slots.some((slot) => slot === null)) return;

    const firstGroupId = row.slots[0]!.groupId;
    const isComplete = row.slots.every((slot) => slot!.groupId === firstGroupId);

    if (isComplete) {
      const group = this.selectedGroups.find((g) => g.id === firstGroupId)!;
      // const words = row.slots.map((s) => s!.word);
      this.rows.update((rows) =>
        rows.map((r, i) => (i === rowIndex ? { ...r, completed: true, theme: group.category } : r)),
      );
      // this.gameService.foundGroups.update((count) => count + 1);
      // this.openQuiz(firstGroupId, words);
    }
  }

  private pickRandom<T>(arr: T[], count: number): T[] {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
  }
}
