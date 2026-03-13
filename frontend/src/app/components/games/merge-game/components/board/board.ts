import { Component, computed, effect, inject } from '@angular/core';
import { WordCard } from '../../models/data.interface';
import { BoardService } from '../../services/board-service';
import { GameService } from '../../services/game-service';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz-service';

@Component({
  selector: 'app-board',
  imports: [CdkDrag, CdkDropList, CdkDragPlaceholder],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  protected gameService = inject(GameService);
  protected quizService = inject(QuizService);
  protected readonly rows = this.boardService.rows;

  constructor() {
    effect(() => {
      if (this.quizService.activeQuiz()) {
        this.router.navigate(['/merge-game/quiz']);
      }
    });
  }

  protected getSlotId(rowIndex: number, slotIndex: number): string {
    return `slot-${rowIndex}-${slotIndex}`;
  }

  protected readonly allSlotIds = computed(() =>
    this.rows().flatMap((row, rowIndex) =>
      row.completed ? [] : row.slots.map((_, slotIndex) => this.getSlotId(rowIndex, slotIndex)),
    ),
  );

  protected onDrop(event: CdkDragDrop<WordCard | null>, rowIndex: number, slotIndex: number): void {
    if (event.previousContainer === event.container) return;

    const rows = this.rows();
    const [, prevRow, prevSlot] = event.previousContainer.id.split('-').map(Number);

    const draggedCard = rows[prevRow].slots[prevSlot];
    const targetCard = rows[rowIndex].slots[slotIndex];

    let newRows = rows.map((row) => ({ ...row, slots: [...row.slots] }));
    newRows[rowIndex].slots[slotIndex] = draggedCard;
    newRows[prevRow].slots[prevSlot] = targetCard;

    newRows = this.boardService.checkRow(newRows, rowIndex);
    newRows = this.boardService.checkRow(newRows, prevRow);
    this.rows.set(newRows);
  }

  protected onRestart(): void {
    this.gameService.resetGame();
    this.router.navigate(['/merge-game/settings']);
  }
}
