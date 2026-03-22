import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { UserStore } from '../../../../../core/stores/user-store/user-store';
import { PASSWORD_PATTERN } from '../../../../../core/patterns/password-pattern';
import { PasswordForm as IPasswordForm, PasswordField } from '../models/user-form.interface';
import { passwordsRulesValidator } from './validators/validators';

@Component({
  selector: 'app-password-form',
  imports: [
    TranslocoDirective,
    TuiCardLarge,
    TuiButton,
    TuiIcon,
    TuiForm,
    TuiAppearance,
    TuiTextfield,
    ReactiveFormsModule,
    TuiPassword,
    TuiError,
    TuiHeader,
    TuiTitle,
  ],
  templateUrl: './password-form.html',
  styleUrl: './password-form.scss',
})
export class PasswordForm {
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);
  protected readonly userStore = inject(UserStore);
  protected readonly isPasswordEditMode = signal(false);

  protected readonly passwordForm = this.fb.nonNullable.group<IPasswordForm>(
    {
      currentPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN),
      ]),
      newPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN),
      ]),
      confirmPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(PASSWORD_PATTERN),
      ]),
    },
    { validators: passwordsRulesValidator },
  );

  protected toggleEdit(mode: WritableSignal<boolean>): void {
    mode.update((v) => !v);
    if (!mode()) {
      this.passwordForm.reset();
    }
  }

  protected async savePassword(): Promise<void> {
    if (this.passwordForm.invalid) return;

    const { currentPassword: oldPassword, newPassword } = this.passwordForm.getRawValue();

    const isSuccess = await this.userStore.changePassword({ oldPassword, newPassword });

    if (!isSuccess) {
      return;
    }

    this.passwordForm.reset();
    this.isPasswordEditMode.set(false);
  }

  protected getInputError(typeInput: PasswordField): string | null {
    const control = this.passwordForm.get(typeInput);
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return this.translocoService.translate('userProfile.accountSettings.error.required');
    }

    if (control.hasError('pattern')) {
      return this.translocoService.translate(`userProfile.accountSettings.error.passwordPattern`);
    }

    if (typeInput === 'newPassword' && this.passwordForm.hasError('sameAsCurrentPassword')) {
      return this.translocoService.translate(
        'userProfile.accountSettings.error.sameAsCurrentPassword',
      );
    }

    if (typeInput === 'confirmPassword' && this.passwordForm.hasError('passwordMismatch')) {
      return this.translocoService.translate('userProfile.accountSettings.error.mismathPassword');
    }

    return null;
  }
}
