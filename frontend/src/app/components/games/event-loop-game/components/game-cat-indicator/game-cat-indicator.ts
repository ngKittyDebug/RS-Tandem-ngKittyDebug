import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-game-cat-indicator',
  imports: [],
  templateUrl: './game-cat-indicator.html',
  styleUrl: './game-cat-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCatIndicator {
  private readonly AUDIO_PATH = 'assets/audio/cat-purr.mp3';
  private readonly AUTO_STOP_MS = 10_000;
  private readonly AUDIO_VOLUME = 0.25;

  private readonly destroyRef = inject(DestroyRef);

  public readonly isChecking = input<boolean>(false);

  private isStarting = false;
  protected readonly isPurring = signal(false);

  private audio: HTMLAudioElement | null = null;
  private autoStopSubscription: Subscription | null = null;

  private readonly stopWhenChecking = effect(() => {
    if (this.isChecking()) {
      this.stop();
    }
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stop();
      this.audio = null;
    });
  }

  protected toggle(): void {
    if (this.isChecking()) {
      return;
    }

    if (this.isPurring()) {
      this.stop();
      return;
    }

    this.start();
  }

  private start(): void {
    if (this.isStarting || this.isPurring()) {
      return;
    }

    if (!this.audio) {
      this.audio = new Audio(this.AUDIO_PATH);
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = this.AUDIO_VOLUME;
    }

    this.isStarting = true;
    this.clearAutoStop();

    void this.audio
      .play()
      .then(() => {
        this.isPurring.set(true);

        this.autoStopSubscription = timer(this.AUTO_STOP_MS).subscribe(() => {
          this.stop();
        });
      })
      .catch((error: unknown) => {
        console.error('Failed to play cat purring audio', error);
        this.isPurring.set(false);
      })
      .finally(() => {
        this.isStarting = false;
      });
  }

  private stop(): void {
    this.clearAutoStop();
    this.isStarting = false;

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.isPurring.set(false);
  }

  private clearAutoStop(): void {
    this.autoStopSubscription?.unsubscribe();
    this.autoStopSubscription = null;
  }
}
