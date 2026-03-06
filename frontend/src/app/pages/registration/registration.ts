import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTextfield } from '@taiga-ui/core';
import {} from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { passwordsValidator } from './validators';
import { AuthService } from '../../core/services/register-service';
import { PASSWORD_PATTERN } from '../../core/patterns/password-pattern';
import { EMAIL_PATTERN } from '../../core/patterns/email-pattern';
import { RegisterDto } from './models/register.interfaces';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss'],
  standalone: true,
  imports: [
    TuiTextfield,
    TuiButton,
    TuiAppearance,
    TuiCardLarge,
    TuiForm,
    ReactiveFormsModule,
    TranslocoModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public t(key: string): string {
    return this.translocoService.translate(key);
  }
  public registrationForm = this.fb.group(
    {
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      passwordRepeat: ['', [Validators.required]],
    },
    {
      validators: passwordsValidator,
    },
  );

  public async submit(): Promise<void> {
    const { username, email, password } = this.registrationForm.getRawValue();
    if (!username || !email || !password) throw new Error('Что-то не так');
    const User: RegisterDto = {
      username: username,
      email: email,
      password: password,
    };
    console.log(User);
    try {
      await firstValueFrom(this.authService.register(User));
      console.log('Регистрация прошла успешно!');
    } catch (error) {
      console.error(error);
      console.log('Произошла ошибка при регистрации');
    }
    // const respons = await fetch('https://meow-vault-pr-44.onrender.com/auth/register', { method: "POST", body: JSON.stringify(User) })
    // const data = await respons.json();
    // console.log(data)
  }
  //   public async simulateNetworkError(): Promise<void> {
  //     // Запрос на несуществующий домен вызовет HttpErrorResponse с status 0 (сетевая ошибка)
  //     const url = 'https://meow-vault-pr-44.onrender.com/auth/register';
  //     const { username, email, password } = this.registrationForm.getRawValue();
  //     const User: RegisterDto = {
  //       "email": "user@example.com",
  //       "username": "john_doe",
  //       "password": "StrongPass123!"
  //     };
  //     try {
  //       const response = await fetch(url, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json' // Обязательно для JSON
  //         },
  //         body: JSON.stringify(User) // Преобразование объекта в строку
  //       });

  //       const result = await response.json();
  //       console.log(result);
  //       const label = result.error;
  //       const message = result.message.toString();
  //     } catch (error) {
  //       console.error('Ошибка запроса:', error);
  //     }

  //   }
}
