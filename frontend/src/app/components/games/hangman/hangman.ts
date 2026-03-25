import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Menu } from './components/menu/menu.component';
import { GameComponent } from './components/game/game.component';
import { ResultsComponent } from './components/results/results.component';
type Screen = 'menu' | 'game' | 'results';
@Component({
  selector: 'app-hangman',
  standalone: true,
  imports: [Menu, GameComponent, ResultsComponent],
  templateUrl: './hangman.html',
  styleUrls: ['./hangman.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hangman {
  public currentScreen: Screen = 'menu';
  protected goToMenu(): void {
    this.currentScreen = 'menu';
  }

  protected startGame(): void {
    this.currentScreen = 'game';
  }

  protected goToResults(): void {
    this.currentScreen = 'results';
  }
}
