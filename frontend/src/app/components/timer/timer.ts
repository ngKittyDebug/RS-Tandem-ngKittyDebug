import { Component, input, signal, OnInit, OnDestroy, output, computed } from '@angular/core';
import { TIMER_MODE } from './models/timer-mode.enum';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
})
export class Timer implements OnInit, OnDestroy {
  public timerMode = input<TIMER_MODE>(TIMER_MODE.UP);
  public startValue = input<number>(0);
  public maxValue = input<number>(14400);
  public finishedTimer = output<void>();

  public timerSeconds = signal(0);
  public timerIsActive = signal(false);
  private timerId: ReturnType<typeof setInterval> | undefined;

  public displayTime = computed(() => {
    const totalSeconds = Math.abs(this.timerSeconds());
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  });

  public ngOnInit(): void {
    this.timerSeconds.set(this.startValue());
  }

  public ngOnDestroy(): void {
    this.stop();
  }

  public start(): void {
    if (this.timerIsActive()) return;
    if (this.timerMode() === TIMER_MODE.UP && this.timerSeconds() >= this.maxValue()) return;

    this.timerIsActive.set(true);
    this.timerId = setInterval(() => {
      this.timerSeconds.update((value) => {
        if (this.timerMode() === TIMER_MODE.UP) {
          const nextValue = value + 1;
          if (nextValue >= this.maxValue()) {
            this.stop();
            this.finishedTimer.emit();
            return this.maxValue();
          }
          return nextValue;
        } else {
          const nextValue = value - 1;
          if (nextValue <= 0) {
            this.stop();
            this.finishedTimer.emit();
            return 0;
          }
          return nextValue;
        }
      });
    }, 1000);
  }

  public stop(): void {
    this.timerIsActive.set(false);
    if (this.timerId) clearInterval(this.timerId);
  }

  public reset(): void {
    this.stop();
    this.timerSeconds.set(this.startValue());
  }
}
