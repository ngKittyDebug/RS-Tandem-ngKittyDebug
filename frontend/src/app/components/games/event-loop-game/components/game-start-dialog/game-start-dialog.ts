import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiAppearance, TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';

@Component({
  selector: 'app-game-start-dialog',
  imports: [TranslocoDirective, TuiCardLarge, TuiAppearance, TuiIcon, TuiButton, TuiTitle],
  templateUrl: './game-start-dialog.html',
  styleUrl: './game-start-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStartDialog {
  public readonly startGame = output<void>();
}
