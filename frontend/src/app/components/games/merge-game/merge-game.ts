import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { GameService } from './services/game-service';

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

  protected goToTheory(): void {
    this.router.navigate(['/merge-game/theory']);
  }

  protected goToMain(): void {
    this.router.navigate([this.mainRouterPath]);
  }

  protected goToSettingsGame(): void {
    this.gameService.setStatus('idle');
    this.router.navigate(['/merge-game/settings']);
  }
}
