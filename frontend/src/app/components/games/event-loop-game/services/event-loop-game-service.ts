import { computed, inject, Injectable, signal } from '@angular/core';
import { EventLoopSessionService } from './event-loop-session-service';
import { AnswerItem, Task } from '../models/task.interface';
import { shuffle, toHintLang } from '../utils/utils';
import { EventLoopGameApiService } from './event-loop-game-api-service';
import {
  catchError,
  concat,
  concatMap,
  EMPTY,
  finalize,
  from,
  of,
  Subject,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { GameStatus } from '../models/task.const';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../../../core/services/user/user-service';
import { GameLabels } from '../../../../shared/enums/game-labels.enum';

const MAX_LIVES = 3;
const CHECKING_TIMER = 300;

@Injectable({
  providedIn: 'root',
})
export class EventLoopGameService {
  private readonly api = inject(EventLoopGameApiService);
  private readonly sessionService = inject(EventLoopSessionService);
  private readonly userService = inject(UserService);
  protected readonly transloco = inject(TranslocoService);

  private readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });
  private readonly hintLang = computed(() => toHintLang(this.activeLang()));

  private allTasks: Task[] = [];

  public readonly isStarted = signal(false);
  public readonly isLoading = signal(false);
  public readonly loadError = signal<string | null>(null);

  public readonly isChecking = signal(false);
  private isCheckCancelled = false;
  private readonly checkingIndex = signal<number | null>(null);
  private readonly destroyCheching$ = new Subject<void>();

  protected readonly session = signal<Task[]>([]);
  protected readonly level = signal(0);

  public readonly gameStatus = signal<GameStatus>(GameStatus.Idle);
  public readonly lives = signal(MAX_LIVES);
  public readonly lifeItems = computed(() =>
    Array.from({ length: MAX_LIVES }, (_, index) => ({
      id: index + 1,
      isActive: index < this.lives(),
    })),
  );

  protected readonly currentTask = computed(() => this.session()[this.level()] ?? null);
  public readonly totalTasks = computed(() => this.session().length);
  public readonly currentTaskIndex = computed(() => (this.session().length ? this.level() + 1 : 0));
  public readonly difficulty = computed(() => this.currentTask()?.difficulty ?? '');
  public readonly codeSnippet = computed(() => this.currentTask()?.code.trim() ?? '');
  protected readonly correctAnswer = computed(() => this.currentTask()?.output ?? []);
  public readonly userAnswer = signal<AnswerItem[]>([]);
  protected readonly isGameOver = computed(() => this.lives() <= 0);
  public readonly isLastTask = computed(
    () => this.session().length > 0 && this.level() === this.session().length - 1,
  );

  public readonly hint = computed(() => {
    const task = this.currentTask();

    if (!task) return '';

    return task.hint[this.hintLang()];
  });

  public readonly progressItems = computed(() =>
    this.session().map((_, index) => {
      if (index < this.level()) return 'done';
      if (index === this.level()) return 'current';
      return 'upcoming';
    }),
  );

  public readonly isDragDisabled = computed(() => {
    return (
      this.gameStatus() === GameStatus.Correct ||
      this.gameStatus() === GameStatus.Finished ||
      this.isChecking() ||
      this.isGameOver()
    );
  });

  public loadGame(): void {
    if (this.isLoading() || this.allTasks.length) {
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    this.api
      .getTasks()
      .pipe(
        tap((tasks) => {
          this.allTasks = tasks;
        }),
        catchError((error) => {
          const message = error instanceof Error ? error.message : 'Failed to load tasks';

          this.loadError.set(message);
          return EMPTY;
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe();
  }

  public start(): void {
    if (!this.allTasks.length || this.isLoading()) {
      return;
    }

    this.stopChecking();

    this.isStarted.set(true);
    this.startNewSession();
  }

  public reset(): void {
    this.stopChecking();
    this.isStarted.set(false);
    this.gameStatus.set(GameStatus.Idle);

    this.level.set(0);
    this.lives.set(MAX_LIVES);

    this.session.set([]);
    this.userAnswer.set([]);
    this.loadError.set(null);
  }

  public reorderAnswer(previousIndex: number, currentIndex: number): void {
    const next = [...this.userAnswer()];
    moveItemInArray(next, previousIndex, currentIndex);

    this.userAnswer.set(
      next.map((item) => ({
        ...item,
        status: 'idle' as const,
      })),
    );

    if (this.gameStatus() !== GameStatus.Finished) {
      this.gameStatus.set(GameStatus.Idle);
    }
  }

  public checkAnswer(): void {
    if (this.isChecking()) {
      return;
    }

    this.isCheckCancelled = false;

    const answers: AnswerItem[] = [...this.userAnswer()].map((item) => ({
      ...item,
      status: 'idle',
    }));
    const correctAnswer = this.correctAnswer();

    this.userAnswer.set(answers);
    this.isChecking.set(true);
    this.gameStatus.set(GameStatus.Idle);

    from(answers.map((_, index) => index))
      .pipe(
        concatMap((index) =>
          concat(
            of(index).pipe(
              tap(() => {
                this.checkingIndex.set(index);

                answers[index] = {
                  ...answers[index],
                  status: 'checking',
                };

                this.userAnswer.set([...answers]);
              }),
            ),
            timer(CHECKING_TIMER).pipe(
              tap(() => {
                const isCorrect = answers[index].value === correctAnswer[index];

                answers[index] = {
                  ...answers[index],
                  status: isCorrect ? 'correct' : 'incorrect',
                };

                this.userAnswer.set([...answers]);
              }),
            ),
          ),
        ),
        finalize(() => {
          this.checkingIndex.set(null);
          this.isChecking.set(false);

          if (this.isCheckCancelled) {
            return;
          }

          const isAllCorrect = answers.every((item) => item.status === 'correct');

          if (isAllCorrect) {
            if (this.isLastTask()) {
              this.gameStatus.set(GameStatus.Finished);
              return;
            }

            this.gameStatus.set(GameStatus.Correct);
            return;
          }

          this.loseLife();

          if (this.isGameOver()) {
            this.gameStatus.set(GameStatus.Failed);
            return;
          }

          this.gameStatus.set(GameStatus.Incorrect);
        }),
        takeUntil(this.destroyCheching$),
      )
      .subscribe();
  }

  public nextTask(): void {
    if (this.isLastTask()) {
      return;
    }

    const nextLevel = this.level() + 1;

    this.level.set(nextLevel);
    this.userAnswer.set(this.createAnswerItems(this.session()[nextLevel].output));
    this.gameStatus.set(GameStatus.Idle);
  }

  public stopChecking(): void {
    this.isCheckCancelled = true;
    this.destroyCheching$.next();
    this.isChecking.set(false);
    this.checkingIndex.set(null);
  }

  private initSession(): void {
    const session = this.sessionService.createSession(this.allTasks, 2);

    this.session.set(session);
    this.level.set(0);
    this.gameStatus.set(GameStatus.Idle);
    this.lives.set(MAX_LIVES);
    this.userAnswer.set(this.createAnswerItems(session[0]?.output ?? []));
  }

  private startNewSession(): void {
    this.initSession();
    this.trackSessionStart();
  }

  private trackSessionStart(): void {
    this.userService
      .statsUpdate(GameLabels.EventLoop)
      .pipe(
        catchError((error) => {
          console.error('Stats update failed', error);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  private createAnswerItems(output: string[]): AnswerItem[] {
    return shuffle(
      output.map((value) => ({
        id: crypto.randomUUID(),
        value,
        status: 'idle',
      })),
    );
  }

  private loseLife(): void {
    if (this.lives() <= 0) {
      return;
    }

    this.lives.update((value) => value - 1);
  }
}
