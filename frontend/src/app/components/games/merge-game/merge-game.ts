import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-merge-game',
  imports: [RouterOutlet, TranslocoDirective, TuiButton, TuiTitle],
  templateUrl: './merge-game.html',
  styleUrl: './merge-game.scss',
})
export class MergeGame {}
