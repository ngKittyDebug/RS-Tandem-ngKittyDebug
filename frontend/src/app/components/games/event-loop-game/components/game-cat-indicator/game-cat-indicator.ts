import { Component, input } from '@angular/core';

@Component({
  selector: 'app-game-cat-indicator',
  imports: [],
  templateUrl: './game-cat-indicator.html',
  styleUrl: './game-cat-indicator.scss',
})
export class GameCatIndicator {
  public readonly isChecking = input<boolean>(false);
}
