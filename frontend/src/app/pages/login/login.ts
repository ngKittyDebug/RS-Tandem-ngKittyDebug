import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LoginForm } from './models/login-form.interface';
import { EMAIL_PATTERN } from '../../core/patterns/email-pattern';
import { PASSWORD_PATTERN } from '../../core/patterns/password-pattern';
import { Router, RouterLink } from '@angular/router';
import {
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiTextfield,
  TuiTitle,
  TuiIcon,
  TuiLink,
} from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { LoginMode } from './models/login-mode.interface';
import { AuthService } from '../../core/services/auth/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginField } from './models/login-field.type';
import { finalize, from, switchMap } from 'rxjs';
import { USER_PATTERN } from '../../core/patterns/user-pattern';
import { ImgCat } from './components/img-cat/img-cat';
import { AppRoute, getRoutePath } from '../../app.routes';
import { AppTosterService } from '../../core/services/app-toster-service';
import { UserStore } from '../../core/stores/user-store/user-store';

@Component({
  selector: 'app-login',
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    RouterLink,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiForm,
    TuiHeader,
    TuiTextfield,
    TuiTitle,
    TuiIcon,
    TuiPassword,
    TuiLink,
    ImgCat,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private translocoService = inject(TranslocoService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private tosterService = inject(AppTosterService);
  private userStore = inject(UserStore);
  protected loginMode = signal<LoginMode>('email');
  protected isLoading = signal<boolean>(false);
  protected registerRouterPath = getRoutePath(AppRoute.REGISTRATION);

  protected readonly loginForm = this.fb.nonNullable.group<LoginForm>({
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(EMAIL_PATTERN),
    ]),
    username: this.fb.nonNullable.control(''),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(PASSWORD_PATTERN),
    ]),
  });

  protected switchMode(mode: LoginMode): void {
    if (this.loginMode() === mode) return;

    this.loginMode.set(mode);

    const email = this.loginForm.controls.email;
    const username = this.loginForm.controls.username;

    if (mode === 'email') {
      email.setValidators([Validators.required, Validators.pattern(EMAIL_PATTERN)]);
      username.clearValidators();
      username.reset('');
    } else {
      username.setValidators([Validators.required, Validators.pattern(USER_PATTERN)]);
      email.clearValidators();
      email.reset('');
    }

    email.updateValueAndValidity();
    username.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);

    const { email, username, password } = this.loginForm.getRawValue();

    const data =
      this.loginMode() === 'email'
        ? { email: this.normalize(email), password }
        : { username: this.normalize(username), password };

    this.authService
      .login(data)
      .pipe(
        switchMap(() => from(this.userStore.loadUser())),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate([getRoutePath(AppRoute.MAIN)]);
        },
        error: (error) => {
          const key =
            error.status === 403 ? 'login.error.invalidCredentials' : 'login.error.serverError';

          const message = this.translocoService.translate(key);
          this.tosterService.showErrorToster(message);
        },
      });
  }

  protected getInputError(typeInput: LoginField): string | null {
    const control = this.loginForm.get(typeInput);
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return this.translocoService.translate('login.error.required');
    }

    if (control.hasError('pattern')) {
      return this.translocoService.translate(`login.error.${typeInput}Pattern`);
    }

    return null;
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase();
  }
}
