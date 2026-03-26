import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiButton, TuiDialogService, TuiTitle } from '@taiga-ui/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { GameService } from './services/game-service';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { filter } from 'rxjs';

@Component({
  selector: 'app-merge-game',
  imports: [RouterOutlet, TranslocoDirective, TuiButton, TuiTitle],
  templateUrl: './merge-game.html',
  styleUrl: './merge-game.scss',
})
export class MergeGame {
  private router = inject(Router);
  protected mainRouterPath = getRoutePath(AppRoute.MAIN);
  protected gameService = inject(GameService);
  private dialogs = inject(TuiDialogService);
  private translocoService = inject(TranslocoService);

  protected goToTheory(): void {
    this.router.navigate(['/merge-game/theory']);
  }

  protected goToMain(): void {
    this.navigateWithConfirm(this.mainRouterPath);
  }

  protected goToSettingsGame(): void {
    this.navigateWithConfirm('/merge-game/settings');
  }

  private navigateWithConfirm(path: string): void {
    if (this.gameService.statusGame() !== 'playing') {
      this.gameService.resetGame();
      this.router.navigate([path]);
      return;
    }
    this.dialogs
      .open(TUI_CONFIRM, {
        label: this.translocoService.translate('mergeGame.exitConfirm.label'),
        data: {
          content: this.translocoService.translate('mergeGame.exitConfirm.content'),
          yes: this.translocoService.translate('mergeGame.exitConfirm.yes'),
          no: this.translocoService.translate('mergeGame.exitConfirm.no'),
        },
      })
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.gameService.resetGame();
        this.router.navigate([path]);
      });
  }
}
