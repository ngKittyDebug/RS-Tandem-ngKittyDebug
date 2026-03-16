import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { Registration } from './registration';
import { provideRouter } from '@angular/router';

describe('Registration', () => {
  let component: Registration;
  let fixture: ComponentFixture<Registration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Registration,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Registration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('RegistrationForm', () => {
    it('should have username input', () => {
      expect(component.registrationForm.contains('username')).toBeTruthy();
    });
    it('should have email input', () => {
      expect(component.registrationForm.contains('email')).toBeTruthy();
    });
    it('should have password input', () => {
      expect(component.registrationForm.contains('password')).toBeTruthy();
    });
    it('should have passwordRepeat input', () => {
      expect(component.registrationForm.contains('passwordRepeat')).toBeTruthy();
    });
  });

  describe('RegistrationInvalidForm', () => {
    it('Form is invalid', () => {
      expect(component.registrationForm.valid).toBeFalsy();
    });
  });
});
