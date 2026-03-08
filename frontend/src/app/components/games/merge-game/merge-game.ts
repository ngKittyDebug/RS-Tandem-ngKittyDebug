import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-merge-game',
  imports: [RouterOutlet, TranslocoDirective, TuiButton, TuiTitle],
  templateUrl: './merge-game.html',
  styleUrl: './merge-game.scss',
})
export class MergeGame {
  private router = inject(Router);

  protected goToTheory(): void {
    this.router.navigate(['/merge-game/theory']);
  }
}
