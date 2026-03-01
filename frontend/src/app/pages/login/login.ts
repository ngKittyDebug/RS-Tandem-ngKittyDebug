import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LoginForm } from './models/login-form.interface';
import { EMAIL_PATTERN } from '../../core/patterns/email-pattern';
import { PASSWORD_PATTERN } from '../../core/patterns/password-pattern';
import { RouterLink } from '@angular/router';
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
  private translocoService = inject(TranslocoService);

  protected readonly loginForm = this.fb.nonNullable.group<LoginForm>({
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(EMAIL_PATTERN),
    ]),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(PASSWORD_PATTERN),
    ]),
  });

  protected submit(): void {
    console.log('login form submit');
  }

  protected loginWithGoogle(): void {
    console.log('login form with google');
  }

  protected getInputError(typeInput: 'email' | 'password'): string | null {
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
