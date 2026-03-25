import { TestBed, ComponentFixture } from '@angular/core/testing';

import { TIMER_MODE } from './models/timer-mode.enum';
import { expect, it, describe, beforeEach, afterEach, vi } from 'vitest';
import { Timer } from './timer';

describe('Timer Component (Vitest Timers)', () => {
  let component: Timer;
  let fixture: ComponentFixture<Timer>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [Timer],
    }).compileComponents();

    fixture = TestBed.createComponent(Timer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should increase the time every second in UP mode', () => {
    fixture.componentRef.setInput('timerMode', TIMER_MODE.UP);
    fixture.componentRef.setInput('startValue', 0);
    component.ngOnInit();

    component.start();
    vi.advanceTimersByTime(3000);

    expect(component.timerSeconds()).toBe(3);
    expect(component.displayTime()).toBe('00:03');
  });

  it('should reduce the time and end in the DOWN mode', () => {
    const emitSpy = vi.spyOn(component.finishedTimer, 'emit');

    fixture.componentRef.setInput('timerMode', TIMER_MODE.DOWN);
    fixture.componentRef.setInput('startValue', 5);
    component.ngOnInit();

    component.start();
    vi.advanceTimersByTime(5000);

    expect(component.timerSeconds()).toBe(0);
    expect(component.timerIsActive()).toBe(false);
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not run multiple intervals when start()', () => {
    fixture.componentRef.setInput('timerMode', TIMER_MODE.UP);
    component.start();
    component.start();

    vi.advanceTimersByTime(1000);
    expect(component.timerSeconds()).toBe(1);
  });

  it('should stop the countdown and change the status', () => {
    fixture.componentRef.setInput('startValue', 0);
    component.ngOnInit();

    component.start();
    vi.advanceTimersByTime(2000);

    component.stop();
    vi.advanceTimersByTime(2000);

    expect(component.timerSeconds()).toBe(2);
    expect(component.timerIsActive()).toBe(false);
  });

  it('should reset timerSeconds to startValue', () => {
    fixture.componentRef.setInput('startValue', 100);
    component.ngOnInit();

    component.timerSeconds.set(50);
    component.reset();

    expect(component.timerSeconds()).toBe(100);
  });

  it('should format the minutes correctly in displayTime', () => {
    fixture.componentRef.setInput('startValue', 125);
    component.ngOnInit();

    expect(component.displayTime()).toBe('02:05');
  });
});
