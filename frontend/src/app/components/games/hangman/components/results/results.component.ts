import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { GameStats } from '../game/game.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  @Output() public menu = new EventEmitter<void>();
  private readonly statsStorageKey = 'hangman_game_stats';

  public stats: GameStats = {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
    god: 0,
  };
  public readonly totalWords = {
    easy: 18,
    medium: 20,
    hard: 15,
    expert: 20,
    god: 20,
  };

  constructor() {
    this.loadStats();
  }

  private loadStats(): void {
    const savedStats = localStorage.getItem(this.statsStorageKey);

    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
  }
}
