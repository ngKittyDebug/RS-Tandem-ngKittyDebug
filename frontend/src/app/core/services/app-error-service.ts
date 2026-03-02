import { Injectable, inject } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class AppErrorService {
  private readonly alerts = inject(TuiAlertService);

  public handleToster(message: string, label = 'Ошибка'): void {
    this.alerts.open(message, { label, appearance: 'negative', autoClose: 8000 }).subscribe();
  }
}
