import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTextfield, TuiError, TuiIcon, TuiLink } from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { passwordsValidator } from './validators';
import { AuthService } from '../../core/services/auth/auth-service';
import { PASSWORD_PATTERN } from '../../core/patterns/password-pattern';
import { EMAIL_PATTERN } from '../../core/patterns/email-pattern';
import { USER_PATTERN } from '../../core/patterns/user-pattern';
import { RegisterDto } from './models/register.interfaces';
import { RegisterField } from './models/register-field.type';
import { firstValueFrom } from 'rxjs';
import { AppRoute, getRoutePath } from '../../app.routes';
import { RouterModule, Router } from '@angular/router';
import { AppTosterService } from '../../core/services/app-toster-service';
import { HttpErrorResponse } from '@angular/common/http';
import { EyeCompassDirective } from '../../core/directive/eye-compass.directive';
import { Loader } from '../../core/components/loader/loader';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../core/stores/user-store/user-store';

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
    EyeCompassDirective,
    Loader,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private AuthService = inject(AuthService);
  private toster = inject(AppTosterService);
  protected loginRouterPath = getRoutePath(AppRoute.LOGIN);
  private router = inject(Router);
  private userStore = inject(UserStore);
  public t(key: string): string {
    return this.translocoService.translate(key);
  }
  public registrationForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.pattern(USER_PATTERN)]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
      passwordRepeat: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    },
    {
      validators: passwordsValidator,
    },
  );

  protected isLoading = signal<boolean>(false);

  public async submit(): Promise<void> {
    if (this.registrationForm.invalid) return;
    const { username, email, password } = this.registrationForm.getRawValue();
    if (!username || !email || !password) return;
    const User: RegisterDto = {
      username: username,
      email: email,
      password: password,
    };
    this.isLoading.set(true);
    try {
      await firstValueFrom(this.AuthService.register(User));
      await this.userStore.loadUser();
      this.router.navigate([getRoutePath(AppRoute.MAIN)]);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        let key = 'registration.error.unknown';
        if (error.status === 400) key = 'registration.error.invalidData';
        if (error.status === 409) key = 'registration.error.userExists';
        const message = this.translocoService.translate(key);
        this.toster.showErrorToster(message);
      } else {
        this.toster.showErrorToster(this.translocoService.translate('registration.error.unknown'));
      }
    } finally {
      this.isLoading.set(false);
    }
  }
  protected getInputError(typeInput: RegisterField): string | null {
    const control = this.registrationForm.get(typeInput);
    if (!control || !control.touched) return null;
    if (control.hasError('required')) {
      return this.translocoService.translate('registration.error.required');
    }
    if (control.hasError('pattern')) {
      if (typeInput === 'passwordRepeat' || typeInput === 'password') {
        return this.translocoService.translate('registration.error.passwordPattern');
      }
      return this.translocoService.translate(`registration.error.${typeInput}Pattern`);
    }
    if (typeInput === 'passwordRepeat' && this.registrationForm.hasError('passwords')) {
      return this.translocoService.translate('registration.error.passwordMismatch');
    }
    return null;
  }
}
