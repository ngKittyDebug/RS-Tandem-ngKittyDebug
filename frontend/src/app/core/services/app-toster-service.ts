import { Injectable, inject } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

const DEFAULT_ALERT_CLOSE_TIME = 4000;

export enum TosterLabels {
  Error = 'error',
  Warning = 'warning',
  Positive = 'meow',
}

export enum TosterAppearances {
  Error = 'negative',
  Warning = 'warning',
  Positive = 'positive',
}

@Injectable({
  providedIn: 'root',
})
export class AppTosterService {
  private readonly alerts = inject(TuiAlertService);

  public showErrorToster(
    message: string,
    label: string = TosterLabels.Error,
    closeTime = DEFAULT_ALERT_CLOSE_TIME,
  ): void {
    this.alerts
      .open(message, { label, appearance: TosterAppearances.Error, autoClose: closeTime })
      .subscribe();
  }

  public showWarningToster(
    message: string,
    label: string = TosterLabels.Warning,
    closeTime = DEFAULT_ALERT_CLOSE_TIME,
  ): void {
    this.alerts
      .open(message, { label, appearance: TosterAppearances.Warning, autoClose: closeTime })
      .subscribe();
  }

  public showPositiveToster(
    message: string,
    label: string = TosterLabels.Positive,
    closeTime = DEFAULT_ALERT_CLOSE_TIME,
  ): void {
    this.alerts
      .open(message, { label, appearance: TosterAppearances.Positive, autoClose: closeTime })
      .subscribe();
  }
}
