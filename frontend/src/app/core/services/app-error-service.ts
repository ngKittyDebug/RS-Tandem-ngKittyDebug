import { Injectable, inject } from '@angular/core';
import { TuiAlertService, TuiAppearanceOptions } from '@taiga-ui/core';
import { ErrorTosterAppearances, ErrorTosterLabels } from '../../shared/constants/enum';

const DEFAULT_ALERT_CLOSE_TIME = 4000;

@Injectable({
  providedIn: 'root',
})
export class AppErrorService {
  private readonly alerts = inject(TuiAlertService);

  public showCustomToster(
    message: string,
    label: string,
    appearance: TuiAppearanceOptions['appearance'],
    closeTime: number,
  ): void {
    this.alerts.open(message, { label, appearance: appearance, autoClose: closeTime }).subscribe();
  }

  public showErrorToster(
    message: string,
    label = ErrorTosterLabels.Error,
    closeTime = DEFAULT_ALERT_CLOSE_TIME,
  ): void {
    this.alerts
      .open(message, { label, appearance: ErrorTosterAppearances.Error, autoClose: closeTime })
      .subscribe();
  }

  public showWarningToster(
    message: string,
    label = ErrorTosterLabels.Warning,
    closeTime = DEFAULT_ALERT_CLOSE_TIME,
  ): void {
    this.alerts
      .open(message, { label, appearance: ErrorTosterAppearances.Warning, autoClose: closeTime })
      .subscribe();
  }

  public showPositiveToster(
    message: string,
    label = ErrorTosterLabels.Positive,
    closeTime = DEFAULT_ALERT_CLOSE_TIME,
  ): void {
    this.alerts
      .open(message, { label, appearance: ErrorTosterAppearances.Positive, autoClose: closeTime })
      .subscribe();
  }
}
