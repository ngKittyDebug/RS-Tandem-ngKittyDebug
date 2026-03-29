import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  TuiAppearance,
  TuiButton,
  TuiDialog,
  TuiDialogService,
  TuiIcon,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar } from '@taiga-ui/kit';
import { TuiHeader, TuiCardLarge } from '@taiga-ui/layout';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { EventLoopGameService } from './services/event-loop-game-service';
import { GameStartDialog } from './components/game-start-dialog/game-start-dialog';
import { Loader } from '../../../core/components/loader/loader';
import { GameEndDialog, GameEndDialogMode } from './components/game-end-dialog/game-end-dialog';
import { GameStatus } from './models/task.const';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { AnswerItem } from './models/task.interface';

@Component({
  selector: 'app-event-loop-game',
  imports: [
    TranslocoDirective,
    TuiIcon,
    TuiHeader,
    TuiCardLarge,
    CdkDrag,
    CdkDropList,
    TuiAvatar,
    CdkDragPlaceholder,
    TuiTitle,
    TuiAppearance,
    TuiButton,
    Highlight,
    HighlightLineNumbers,
    GameStartDialog,
    GameEndDialog,
    Loader,
    TuiDialog,
  ],
  templateUrl: './event-loop-game.html',
  styleUrl: './event-loop-game.scss',
})
export class EventLoopGame implements OnInit {
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);
  protected readonly game = inject(EventLoopGameService);
  protected readonly transloco = inject(TranslocoService);

  protected readonly isHintOpen = signal(false);
  protected readonly isEndDialogOpen = signal(false);
  protected readonly endMode = signal<GameEndDialogMode>('lose');

  public ngOnInit(): void {
    this.game.loadGame();
  }

  private readonly openDialogEffect = effect(() => {
    const status = this.game.gameStatus();

    if (status === GameStatus.Finished) {
      this.endMode.set('win');
      this.isEndDialogOpen.set(true);
    }

    if (status === GameStatus.Failed) {
      this.endMode.set('lose');
      this.isEndDialogOpen.set(true);
    }
  });

  protected startGame(): void {
    this.game.start();
  }

  protected drop(event: CdkDragDrop<AnswerItem[]>): void {
    this.game.reorderAnswer(event.previousIndex, event.currentIndex);
  }

  protected checkAnswer(): void {
    this.game.checkAnswer();
  }

  protected nextTask(): void {
    this.closeHint();
    this.game.nextTask();
  }

  protected toggleHint(): void {
    this.isHintOpen.update((value) => !value);
  }

  protected closeHint(): void {
    this.isHintOpen.set(false);
  }

  protected onRestart(): void {
    this.closeHint();
    this.isEndDialogOpen.set(false);
    this.game.start();
  }

  protected goToStartScreen(): void {
    this.closeHint();
    this.isEndDialogOpen.set(false);
    this.game.reset();
  }

  protected goToMain(): void {
    this.navigateWithConfirm(getRoutePath(AppRoute.MAIN));
  }

  private navigateWithConfirm(path: string): void {
    if (!this.game.isStarted()) {
      this.game.reset();
      this.router.navigate([path]);
      return;
    }
    this.dialogs
      .open(TUI_CONFIRM, {
        label: this.transloco.translate('eventLoopGame.exitConfirm.label'),
        data: {
          content: this.transloco.translate('eventLoopGame.exitConfirm.content'),
          yes: this.transloco.translate('eventLoopGame.exitConfirm.yes'),
          no: this.transloco.translate('eventLoopGame.exitConfirm.no'),
        },
      })
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.game.reset();
        this.router.navigate([path]);
      });
  }
}
