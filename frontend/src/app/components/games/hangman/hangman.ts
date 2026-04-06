import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuComponent } from './components/menu/menu.component';
import { GameComponent } from './components/game/game.component';
import { ResultsComponent } from './components/results/results.component';
import { GameLabels } from '../../../shared/enums/game-labels.enum';
import { UserService } from '../../../core/services/user/user-service';
import { Router } from '@angular/router';
import { getRoutePath, AppRoute } from '../../../app.routes';

type Screen = 'menu' | 'game' | 'results' | 'main';

@Component({
  selector: 'app-hangman',
  standalone: true,
  imports: [MenuComponent, GameComponent, ResultsComponent],
  templateUrl: './hangman.html',
  styleUrls: ['./hangman.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hangman {
  private readonly userService = inject(UserService);
  private router = inject(Router);

  public currentScreen: Screen = 'menu';
  protected goToMenu(): void {
    this.currentScreen = 'menu';
  }

  protected startGame(): void {
    this.userService.statsUpdate(GameLabels.Hangman).subscribe({});
    this.currentScreen = 'game';
  }

  protected goToResults(): void {
    this.currentScreen = 'results';
  }

  protected goToMain(): void {
    this.router.navigate([getRoutePath(AppRoute.MAIN)]);
  }
}
