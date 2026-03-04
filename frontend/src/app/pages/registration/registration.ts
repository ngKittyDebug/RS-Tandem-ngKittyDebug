import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTextfield, TuiError } from '@taiga-ui/core';
import {} from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { passwordsValidator } from './validators';
import { AuthService } from '../../core/services/register-service';
import { PASSWORD_PATTERN } from '../../core/patterns/password-pattern';
import { EMAIL_PATTERN } from '../../core/patterns/email-pattern';
import { RegisterDto } from './models/register.interfaces';
import { RegisterField } from './models/register-field.type';
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
    TuiError,
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
  }
  protected getInputError(typeInput: RegisterField): string | null {
    const control = this.registrationForm.get(typeInput);
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return this.translocoService.translate('registration.error.required');
    }
    if (control.hasError('pattern')) {
      if (typeInput === 'passwordRepeat') return null;
      return this.translocoService.translate(`registration.error.${typeInput}Pattern`);
    }
    if (typeInput === 'passwordRepeat' && this.registrationForm.hasError('passwords')) {
      return (
        this.translocoService.translate('registration.error.passwordMismatch') ||
        'Пароли не совпадают'
      );
    }

    return null;
  }
}
