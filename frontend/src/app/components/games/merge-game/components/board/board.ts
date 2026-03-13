import { Component, inject } from '@angular/core';
import { WordCard } from '../../models/data.interface';
import { BoardService } from '../../services/board-service';
import { GameService } from '../../services/game-service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  protected gameService = inject(GameService);
  protected readonly rows = this.boardService.rows;

  // Генерируем уникальный id для каждого слота — нужно для cdkDropListConnectedTo
  protected getSlotId(rowIndex: number, slotIndex: number): string {
    return `slot-${rowIndex}-${slotIndex}`;
  }

  // Список всех id слотов — чтобы каждый слот знал о всех остальных
  protected readonly allSlotIds: string[] = Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 4 }, (_, s) => this.getSlotId(r, s)),
  ).flat();

  protected onDrop(event: CdkDragDrop<WordCard | null>, rowIndex: number, slotIndex: number): void {
    // Если бросили в тот же слот — ничего не делаем
    if (event.previousContainer === event.container) return;

    const rows = this.rows();

    // Парсим откуда тащили
    const [, prevRow, prevSlot] = event.previousContainer.id.split('-').map(Number);

    const draggedCard = rows[prevRow].slots[prevSlot];
    const targetCard = rows[rowIndex].slots[slotIndex];

    // Делаем глубокую копию чтобы не мутировать signal напрямую
    const newRows = rows.map((row) => ({ ...row, slots: [...row.slots] }));

    // Swap: меняем карточки местами (даже если целевой слот пустой)
    newRows[rowIndex].slots[slotIndex] = draggedCard;
    newRows[prevRow].slots[prevSlot] = targetCard;

    // Проверяем обе затронутые строки
    this.boardService.checkRow(newRows, rowIndex);
    this.boardService.checkRow(newRows, prevRow);
    this.rows.set(newRows);
  }

  protected onRestart(): void {
    this.gameService.resetGame();
    this.router.navigate(['/merge-game/settings']);
  }
}
