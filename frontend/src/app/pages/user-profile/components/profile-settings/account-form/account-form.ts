import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import {
  TuiAppearance,
  TuiButton,
  TuiDialog,
  TuiError,
  TuiIcon,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { UserStore } from '../../../../../core/stores/user-store/user-store';
import {
  AccountField,
  AccountForm as IAccountForm,
  PasswordConfirmField,
  PasswordConfirmForm,
} from '../models/user-form.interface';
import { USER_PATTERN } from '../../../../../core/patterns/user-pattern';
import { EMAIL_PATTERN } from '../../../../../core/patterns/email-pattern';
import { PASSWORD_PATTERN } from '../../../../../core/patterns/password-pattern';

@Component({
  selector: 'app-account-form',
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
    TuiDialog,
    TuiAutoFocus,
  ],
  templateUrl: './account-form.html',
  styleUrl: './account-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountForm {
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);
  protected readonly userStore = inject(UserStore);
  protected readonly isAccountEditMode = signal(false);
  protected readonly openDialog = signal(false);

  private readonly dialogCloseEffect = effect(() => {
    if (!this.openDialog()) {
      this.passwordConfirmForm.reset({ password: '' });
    }
  });

  private readonly syncUserToFormEffect = effect(() => {
    const user = this.userStore.user();

    if (!user || this.isAccountEditMode()) {
      return;
    }

    this.accountForm.patchValue(
      {
        username: user.username,
        email: user.email,
      },
      { emitEvent: false },
    );
  });

  protected readonly accountForm = this.fb.nonNullable.group<IAccountForm>({
    username: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(USER_PATTERN),
    ]),
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(EMAIL_PATTERN),
    ]),
  });

  protected readonly passwordConfirmForm = this.fb.nonNullable.group<PasswordConfirmForm>({
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(PASSWORD_PATTERN),
    ]),
  });

  protected toggleEdit(mode: WritableSignal<boolean>): void {
    mode.update((v) => !v);
  }

  protected isSaveDisabled(): boolean {
    const user = this.userStore.user();

    if (!user) {
      return true;
    }

    const { username, email } = this.accountForm.getRawValue();

    const notChanged = user.username === username && user.email === email;

    return this.accountForm.invalid || notChanged;
  }

  protected async saveAccount(): Promise<void> {
    if (this.accountForm.invalid || this.passwordConfirmForm.invalid) return;

    const { username, email } = this.accountForm.getRawValue();
    const { password } = this.passwordConfirmForm.getRawValue();

    const payload = {
      username: username,
      email: email,
      password,
    };

    const isSuccess = await this.userStore.updateUser(payload);

    if (!isSuccess) return;

    this.passwordConfirmForm.reset();
    this.openDialog.set(false);
    this.toggleEdit(this.isAccountEditMode);
  }

  protected getInputError(
    form: FormGroup,
    typeInput: AccountField | PasswordConfirmField,
  ): string | null {
    const control = form.get(typeInput);
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return this.translocoService.translate('userProfile.accountSettings.error.required');
    }

    if (control.hasError('pattern')) {
      return this.translocoService.translate(
        `userProfile.accountSettings.error.${typeInput}Pattern`,
      );
    }

    return null;
  }
}
