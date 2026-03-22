import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordForm } from './password-form';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('PasswordForm', () => {
  let component: PasswordForm;
  let fixture: ComponentFixture<PasswordForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PasswordForm,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show hint and not show fields and save button when not in edit mode', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.settings-card__hint')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="currentPassword"]'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('input[formcontrolname="newPassword"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="confirmPassword"]'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeNull();
  });

  it('should show fields and save button when in edit mode', () => {
    const mode = component['isPasswordEditMode'];
    component['toggleEdit'](mode);

    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="currentPassword"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="newPassword"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="confirmPassword"]'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should toggle edit mode on click', () => {
    const button = fixture.nativeElement.querySelector('.settings-card__header-button');
    const mode = component['isPasswordEditMode'];

    expect(mode()).toBe(false);
    button.click();
    expect(mode()).toBe(true);
  });

  it('should initialize form with empty values and edit mode off', () => {
    expect(component['isPasswordEditMode']()).toBe(false);

    const form = component['passwordForm'];

    expect(form.invalid).toBe(true);
    expect(form.value).toEqual({ currentPassword: '', newPassword: '', confirmPassword: '' });
  });

  it('should initialize form with correct validators', () => {
    const form = component['passwordForm'];

    expect(form).toBeDefined();
    expect(form.get('currentPassword')?.validator).toBeDefined();
    expect(form.get('newPassword')?.validator).toBeDefined();
    expect(form.get('confirmPassword')?.validator).toBeDefined();
  });

  it('should toggle edit mode and reset form when mode becomes false', () => {
    const mode = component['isPasswordEditMode'];
    const form = component['passwordForm'];

    component['toggleEdit'](mode);

    form.patchValue({
      currentPassword: 'password',
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    });

    component['toggleEdit'](mode);

    expect(mode()).toBe(false);
    expect(form.getRawValue()).toEqual({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  });

  it('should be invalid when passwords do not match', () => {
    const form = component['passwordForm'];

    form.setValue({
      currentPassword: 'password',
      newPassword: 'newPassword',
      confirmPassword: 'wrongPassword',
    });
    expect(form.valid).toBe(false);
    expect(form.hasError('passwordMismatch')).toBe(true);
  });

  it('it should be invalid when old password and new password are the same', () => {
    const form = component['passwordForm'];

    form.setValue({
      currentPassword: 'password',
      newPassword: 'password',
      confirmPassword: 'password',
    });
    expect(form.valid).toBe(false);
    expect(form.hasError('sameAsCurrentPassword')).toBe(true);
  });
});
