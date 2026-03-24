import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTextfield, TuiError, TuiIcon, TuiLink } from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { passwordsValidator } from './validators';
import { RegistrationService } from '../../core/services/register-service';
import { PASSWORD_PATTERN } from '../../core/patterns/password-pattern';
import { EMAIL_PATTERN } from '../../core/patterns/email-pattern';
import { RegisterDto } from './models/register.interfaces';
import { RegisterField } from './models/register-field.type';
import { firstValueFrom } from 'rxjs';
import { AppRoute, getRoutePath } from '../../app.routes';
import { RouterModule } from '@angular/router';
import { AppTosterService } from '../../core/services/app-toster-service';
import { HttpErrorResponse } from '@angular/common/http';

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
    TuiIcon,
    TuiPassword,
    TuiLink,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private registrationService = inject(RegistrationService);
  private toster = inject(AppTosterService);
  protected loginRouterPath = getRoutePath(AppRoute.LOGIN);
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
    if (!username || !email || !password)
      throw new Error(this.translocoService.translate('registration.error.invalidData'));
    const User: RegisterDto = {
      username: username,
      email: email,
      password: password,
    };
    try {
      await firstValueFrom(this.registrationService.register(User));
    } catch (error) {
      // console.error(error);
      if (error instanceof HttpErrorResponse) {
        let key = 'registration.error.unknown';
        if (error.status === 400) key = 'registration.error.invalidData';
        if (error.status === 409) key = 'registration.error.userExists';
        const message = this.translocoService.translate(key);
        this.toster.showErrorToster(message);
      } else {
        this.toster.showErrorToster(this.translocoService.translate('registration.error.unknown'));
      }
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
      return this.translocoService.translate('registration.error.passwordMismatch');
    }
    return null;
  }
}
