import { Component, inject } from '@angular/core';
import { WordCard } from '../../models/data.interface';
import { BoardService } from '../../services/board-service';
import { GameService } from '../../services/game-service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  imports: [CdkDrag, CdkDropList],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private readonly boardService = inject(BoardService);
  protected gameService = inject(GameService);
  protected readonly rows = this.boardService.rows;

  protected getSlotId(rowIndex: number, slotIndex: number): string {
    return `slot-${rowIndex}-${slotIndex}`;
  }

  protected readonly allSlotIds: string[] = Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 4 }, (_, s) => this.getSlotId(r, s)),
  ).flat();

  protected onDrop(event: CdkDragDrop<WordCard | null>, rowIndex: number, slotIndex: number): void {
    if (event.previousContainer === event.container) return;

    const [prevRow, prevSlot] = event.previousContainer.id.split('-').slice(1).map(Number);

    this.boardService.swapCards(prevRow, prevSlot, rowIndex, slotIndex);
  }
}
