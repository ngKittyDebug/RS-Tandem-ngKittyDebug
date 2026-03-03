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
  TuiAlertService,
} from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { LoginMode } from './models/login-mode.interface';
import { AuthService } from '../../core/services/auth/auth-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginField } from './models/login-field.type';
import { finalize } from 'rxjs';

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
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private translocoService = inject(TranslocoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alerts = inject(TuiAlertService);
  protected loginMode = signal<LoginMode>('email');
  protected isLoading = signal<boolean>(false);

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
      username.setValidators([Validators.required]);
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

    const data = this.loginMode() === 'email' ? { email, password } : { username, password };

    this.authService
      .login(data)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/main']);
        },

        error: (err) => {
          this.alerts
            .open(err.message, { label: 'Error', appearance: 'negative', autoClose: 5000 })
            .subscribe();
        },
      });
  }

  protected loginWithGoogle(): void {
    this.isLoading.set(true);
    this.alerts
      .open('login form with google', { appearance: 'positive', autoClose: 5000 })
      .subscribe();
    this.authService
      .logout()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/registration']);
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
      return typeInput === 'email'
        ? this.translocoService.translate('login.error.emailPattern')
        : this.translocoService.translate('login.error.passwordPattern');
    }

    return null;
  }
}
