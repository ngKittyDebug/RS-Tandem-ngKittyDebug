import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';

import { ProfileSidebar } from './profile-sidebar';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { UserStore } from '../../../../core/stores/user-store/user-store';
import { signal } from '@angular/core';

registerLocaleData(localeRu);
registerLocaleData(localeEn);

interface User {
  username: string;
  email: string;
  createdAt: string;
}

describe('ProfileSidebar', () => {
  let component: ProfileSidebar;
  let fixture: ComponentFixture<ProfileSidebar>;
  let transloco: TranslocoService;

  const createdAt = '2026-03-14T00:00:00Z';
  const userStoreMock = {
    user: signal<User | null>({
      username: 'user',
      email: 'user@test.com',
      createdAt,
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileSidebar,
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

    fixture = TestBed.createComponent(ProfileSidebar);
    component = fixture.componentInstance;
    transloco = TestBed.inject(TranslocoService);

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render username and email from the store', () => {
    expect(fixture.nativeElement.querySelector('h2')?.textContent?.trim()).toBe('user');
    expect(fixture.nativeElement.querySelector('header p')?.textContent?.trim()).toBe(
      'user@test.com',
    );
  });

  it('should format created date using active language locale', async () => {
    const pipe = new DatePipe('en');

    const expectedRu = pipe.transform(createdAt, 'MMMM yyyy', undefined, 'ru');
    const expectedEn = pipe.transform(createdAt, 'MMMM yyyy', undefined, 'en');

    const subtitle: () => string = () =>
      fixture.nativeElement.querySelector('.profile-sidebar__subtitle')?.textContent?.trim();

    expect(subtitle()).toBe(expectedRu);

    transloco.setActiveLang('en');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(subtitle()).toBe(expectedEn);
  });
});
