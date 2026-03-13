import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiIcon, TuiSurface } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameMode, PersonalityMode, QuestionMode } from '../../models/settings.type';
import { GameService } from '../../services/game-service';
import { Router } from '@angular/router';
import { BoardService } from '../../services/board-service';

@Component({
  selector: 'app-settings',
  imports: [
    TranslocoDirective,
    TuiButton,
    TuiCardLarge,
    TuiHeader,
    TuiSurface,
    FormsModule,
    TuiIcon,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private router = inject(Router);
  private boardService = inject(BoardService);
  protected readonly gameService = inject(GameService);

  protected readonly gameModes: GameMode[] = ['withoutAI', 'withAI'];
  protected readonly personalityModes: PersonalityMode[] = ['neutral', 'kind', 'strict'];
  protected readonly questionModes: QuestionMode[] = [1, 2, 3, 4, 5];

  public ngOnInit(): void {
    this.gameService.resetGame();
  }

  protected onStart(): void {
    this.boardService.initBoard();
    this.gameService.setStatus('playing');
    this.router.navigate(['/merge-game/board']);
  }
}
