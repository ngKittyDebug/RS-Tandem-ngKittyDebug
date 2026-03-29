import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountForm } from './account-form';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { signal } from '@angular/core';
import { User } from '../../../../../core/services/user/models/user.interfaces';
import { UserStore } from '../../../../../core/stores/user-store/user-store';

describe('AccountForm', () => {
  let component: AccountForm;
  let fixture: ComponentFixture<AccountForm>;

  const userStoreMock = {
    user: signal<User | null>({
      username: 'user',
      email: 'user@test.com',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: '2026-03-14T00:00:00Z',
      provider: 'local',
      providerId: null,
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AccountForm,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [{ provide: UserStore, useValue: userStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show username, email and hint and not show fields and save button when not in edit mode', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.settings-card__value')[0].textContent).toBe(
      'user',
    );
    expect(fixture.nativeElement.querySelectorAll('.settings-card__value')[1].textContent).toBe(
      'user@test.com',
    );
    expect(fixture.nativeElement.querySelector('.settings-card__hint')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeFalsy();
  });

  it('should show fields with correct values from store and save button when in edit mode', () => {
    const mode = component['isAccountEditMode'];
    component['toggleEdit'](mode);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[formcontrolname="username"]').value).toBe(
      'user',
    );
    expect(fixture.nativeElement.querySelector('input[formcontrolname="email"]').value).toBe(
      'user@test.com',
    );
    expect(fixture.nativeElement.querySelector('button.settings-card__save')).toBeTruthy();
  });

  it('should toggle edit mode on click', () => {
    const button = fixture.nativeElement.querySelector('.settings-card__header-button');
    const mode = component['isAccountEditMode'];

    expect(mode()).toBe(false);
    button.click();
    expect(mode()).toBe(true);
  });

  it('should initialize form with correct validators', () => {
    const form = component['accountForm'];

    expect(form).toBeDefined();
    expect(form.get('username')?.validator).toBeDefined();
    expect(form.get('email')?.validator).toBeDefined();
  });

  it('should toggle edit mode when mode becomes false', () => {
    const mode = component['isAccountEditMode'];

    component['toggleEdit'](mode);
    component['toggleEdit'](mode);

    expect(mode()).toBe(false);
  });
});
