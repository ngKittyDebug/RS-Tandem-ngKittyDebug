import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { WordCard } from '../../models/data.interface';
import { BoardService } from '../../services/board-service';
import { GameService } from '../../services/game-service';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz-service';
import { AppTosterService } from '../../../../../core/services/app-toster-service';
import { TranslocoService } from '@jsverse/transloco';
import { UserService } from '../../../../../core/services/user/user-service';
import { GameLabels } from '../../../../../shared/enums/game-labels.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-board',
  imports: [CdkDrag, CdkDropList, CdkDragPlaceholder],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private readonly router = inject(Router);
  private readonly boardService = inject(BoardService);
  private readonly tosterService = inject(AppTosterService);
  protected gameService = inject(GameService);
  protected quizService = inject(QuizService);
  private userService = inject(UserService);
  protected readonly rows = this.boardService.rows;
  private translocoService = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      if (this.quizService.activeQuiz()) {
        this.router.navigate(['/merge-game/quiz']);
      }

      if (this.gameService.statusGame() === 'finished') {
        const result = this.gameService.lastResult();
        if (!result) return;
        const { mode, correctAnswers, wrongAnswers } = result;
        const total = correctAnswers + wrongAnswers;
        const message = `🎮 ${this.translocoService.translate('mergeGame.gameResult.mode')}: ${mode} <br> ✅ ${this.translocoService.translate('mergeGame.gameResult.correct')}: ${correctAnswers} / ${total} <br> ❌ ${this.translocoService.translate('mergeGame.gameResult.wrong')}: ${wrongAnswers} / ${total}`;
        this.tosterService.showPositiveToster(
          message,
          this.translocoService.translate('mergeGame.gameResult.title'),
        );
        this.userService
          .statsUpdate(GameLabels.MergeGame)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (err) => console.error('Failed to update stats', err),
          });
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
    this.boardService.updateRows(newRows);
  }

  protected onRestart(): void {
    this.gameService.resetGame();
    this.router.navigate(['/merge-game/settings']);
  }
}
