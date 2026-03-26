import { FormControl } from '@angular/forms';

export interface AccountForm {
  username: FormControl<string>;
  email: FormControl<string>;
}

export interface PasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

export interface PasswordConfirmForm {
  password: FormControl<string>;
}

export type AccountField = keyof AccountForm;
export type PasswordField = keyof PasswordForm;
export type PasswordConfirmField = keyof PasswordConfirmForm;
