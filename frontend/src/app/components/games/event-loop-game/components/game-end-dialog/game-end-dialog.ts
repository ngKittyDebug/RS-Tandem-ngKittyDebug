import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { TuiAppearance, TuiButton, TuiTitle } from '@taiga-ui/core';

export type GameEndDialogMode = 'win' | 'lose';

@Component({
  selector: 'app-game-end-dialog',
  imports: [TuiButton, TuiAppearance, TuiTitle],
  templateUrl: './game-end-dialog.html',
  styleUrl: './game-end-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameEndDialog {
  protected readonly transloco = inject(TranslocoService);

  public readonly mode = input<GameEndDialogMode>('lose');
  public readonly completedTasks = input<number>(0);
  public readonly totalTasks = input<number>(0);
  public readonly livesLeft = input<number>(0);

  public readonly restart = output<void>();
  public readonly exit = output<void>();

  protected readonly isWin = computed(() => this.mode() === 'win');

  protected onRestart(): void {
    this.restart.emit();
  }

  protected onExit(): void {
    this.exit.emit();
  }
}
