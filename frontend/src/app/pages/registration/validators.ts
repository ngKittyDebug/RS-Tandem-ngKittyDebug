import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordsValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const passwordRepeat = control.get('passwordRepeat')?.value;

  return password && passwordRepeat && password !== passwordRepeat ? { passwords: true } : null;
};
