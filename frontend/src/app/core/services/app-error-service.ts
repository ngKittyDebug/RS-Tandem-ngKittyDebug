import { Injectable, inject } from '@angular/core';
import { TuiAlertService, TuiAppearanceOptions } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class AppErrorService {
  private readonly alerts = inject(TuiAlertService);

  public showCustomToster(
    message: string,
    label = 'error',
    appearance: TuiAppearanceOptions['appearance'],
    closeTime: number,
  ): void {
    this.alerts.open(message, { label, appearance: appearance, autoClose: closeTime }).subscribe();
  }

  public showErrorToster(message: string, label = 'error', closeTime = 4000): void {
    this.alerts.open(message, { label, appearance: 'negative', autoClose: closeTime }).subscribe();
  }

  public showWarningToster(message: string, label = 'warning', closeTime = 4000): void {
    this.alerts.open(message, { label, appearance: 'warning', autoClose: closeTime }).subscribe();
  }

  public showPositiveToster(message: string, label = 'meow', closeTime = 4000): void {
    this.alerts.open(message, { label, appearance: 'positive', autoClose: closeTime }).subscribe();
  }
}
