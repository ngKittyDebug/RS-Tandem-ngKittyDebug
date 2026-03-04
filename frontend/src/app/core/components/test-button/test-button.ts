import { Component, inject } from '@angular/core';
import { AppErrorService } from '../../services/app-error-service';

@Component({
  selector: 'app-test-button',
  imports: [],
  templateUrl: './test-button.html',
  styleUrl: './test-button.scss',
})
export class TestButton {
  public errorService = inject(AppErrorService);

  public async simulateNetworkError(): Promise<void> {
    // Запрос на несуществующий домен вызовет HttpErrorResponse с status 0 (сетевая ошибка)
    const url = 'https://meow-vault-pr-44.onrender.com/auth/register';
    const body = {};
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Обязательно для JSON
        },
        body: JSON.stringify(body), // Преобразование объекта в строку
      });

      const result = await response.json();
      console.log(result);
      const label = result.error;
      const message = result.message.toString();
      this.errorService.showPositiveToster(message, label);
      this.errorService.showErrorToster(message, label);
      this.errorService.showWarningToster(message, label);
    } catch (error) {
      console.error('Ошибка запроса:', error);
    }
  }
}
