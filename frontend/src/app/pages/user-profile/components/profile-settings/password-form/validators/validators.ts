import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordsRulesValidator: ValidatorFn = (control: AbstractControl) => {
  const currentPassword = control.get('currentPassword')?.value;
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  const errors: ValidationErrors = {};

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors['sameAsCurrentPassword'] = true;
  }

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    errors['passwordMismatch'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
