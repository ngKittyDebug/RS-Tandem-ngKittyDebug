import { inject, Injectable, signal } from '@angular/core';

import { Data, ResponseData, Row } from '../models/data.interface';
import { QuizService } from './quiz-service';
import { GameService } from './game-service';
import { finalize, tap } from 'rxjs';

const sortRandom = (): number => Math.random() - 0.5;
@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly quizService = inject(QuizService);
  private readonly gameService = inject(GameService);
  public readonly allRowsCompleted = signal(false);
  private dataResponse = signal<ResponseData>({
    data: [],
    pagination: {
      page: 0,
      limit: 0,
      total: 0,
      totalPages: 0,
    },
  });

  private selectGroups = signal<Data[]>([]);
  public readonly rows = signal<Row[]>([]);

  private startQuiz(groupId: number, words: string[]): void {
    const group = this.selectGroups().find((g) => g.id === groupId)!;
    this.quizService.activeQuiz.set({
      groupId,
      theme: group.category,
      words,
      questions: group.words.flatMap((w) => w.questions),
    });
  }

  public checkRow(rows: Row[], rowIndex: number): Row[] {
    const row = rows[rowIndex];
    if (row.completed) return rows;
    const slots = row.slots;
    if (slots.some((slot) => slot === null)) return rows;

    const firstGroupId = slots[0]!.groupId;
    const isComplete = slots.every((slot) => slot!.groupId === firstGroupId);

    if (isComplete) {
      const group = this.selectGroups().find((g) => g.id === firstGroupId)!;
      const words = slots.map((s) => s!.word);
      const newRows = [...rows];
      newRows[rowIndex] = { ...row, completed: true, theme: group.category };
      this.startQuiz(firstGroupId, words);
      if (newRows.every((r) => r.completed)) {
        this.allRowsCompleted.set(true);
      }
      return newRows;
    }

    return rows;
  }

  public initBoard(): void {
    this.allRowsCompleted.set(false);
    this.gameService
      .getAllCards()
      .pipe(
        tap((res: ResponseData) => {
          this.dataResponse.set(res);
          this.selectGroups.set([...res.data].sort(sortRandom).slice(0, 6));
          const shuffledCards = this.selectGroups()
            .flatMap((group) =>
              [...group.words]
                .sort(sortRandom)
                .slice(0, 4)
                .map((item) => ({ word: item.word, groupId: group.id })),
            )
            .sort(sortRandom);

          this.rows.set(
            Array.from({ length: 6 }, (_, rowIndex) => ({
              slots: shuffledCards.slice(rowIndex * 4, rowIndex * 4 + 4),
              completed: false,
            })),
          );
        }),
        finalize(() => console.log(this.dataResponse())),
      )
      .subscribe();
  }
}
