import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { GameStats } from '../game/game.component';
import type { Level } from '../game/game.component';

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
  public readonly levels: { key: Level; label: string; color: string }[] = [
    { key: 'easy', label: 'Easy', color: 'easy' },
    { key: 'medium', label: 'Medium', color: 'medium' },
    { key: 'hard', label: 'Hard', color: 'hard' },
    { key: 'expert', label: 'Expert', color: 'expert' },
    { key: 'god', label: 'God', color: 'god' },
  ];
  constructor() {
    this.loadStats();
  }

  public getPercent(level: Level): number {
    const completed = this.stats[level];
    const total = this.totalWords[level];

    if (!total) return 0;

    return Math.round((completed / total) * 100);
  }
  public getLevelStat(level: Level): number {
    return this.stats[level] ?? 0;
  }
  public get overallPercent(): number {
    const completed =
      this.stats.easy + this.stats.medium + this.stats.hard + this.stats.expert + this.stats.god;

    const total =
      this.totalWords.easy +
      this.totalWords.medium +
      this.totalWords.hard +
      this.totalWords.expert +
      this.totalWords.god;

    if (!total) return 0;

    return Math.round((completed / total) * 100);
  }

  private loadStats(): void {
    const savedStats = localStorage.getItem(this.statsStorageKey);

    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
  }
}
