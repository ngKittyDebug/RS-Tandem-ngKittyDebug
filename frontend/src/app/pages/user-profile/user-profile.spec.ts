import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { UserProfile } from './user-profile';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { UserService } from '../../core/services/user/user-service';
import { UserStore } from '../../core/stores/user-store/user-store';
import { AppTosterService } from '../../core/services/app-toster-service';
import { of } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';
import { User } from '../../core/services/user/models/user.interfaces';

registerLocaleData(localeRu);
registerLocaleData(localeEn);

describe('UserProfile', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<UserProfile>;

  const userServiceMock = {
    statsGetAll: vi.fn(),
  };

  const toastMock = {
    showErrorToster: vi.fn(),
  };

  const userStoreMock = {
    user: signal<User | null>({
      username: 'Kitty',
      email: 'kitty@example.com',
      avatar: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      provider: 'local',
      providerId: null,
    }),

    isLoading: signal(false),
    isUpdatingUser: signal(false),
    isChangingPassword: signal(false),
    isUpdatingAvatar: signal(false),

    updateUser: vi.fn().mockResolvedValue(true),
    changePassword: vi.fn().mockResolvedValue(true),
    updateAvatar: vi.fn().mockResolvedValue(true),
    clear: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    userServiceMock.statsGetAll.mockReturnValue(of([]));
    userStoreMock.user.set({
      username: 'Kitty',
      email: 'kitty@example.com',
      avatar: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      provider: 'local',
      providerId: null,
    });

    await TestBed.configureTestingModule({
      imports: [
        UserProfile,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userServiceMock },
        { provide: UserStore, useValue: userStoreMock },
        { provide: AppTosterService, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide profile settings for non-local provider user', () => {
    userStoreMock.user.set({
      username: 'Kitty',
      email: 'kitty@example.com',
      avatar: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      provider: 'google',
      providerId: 'google-123',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-profile-settings')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-recent-activity')).toBeTruthy();
  });

  it('should not request stats again while stats are already loading', () => {
    userServiceMock.statsGetAll.mockClear();
    component['isStatsLoading'].set(true);

    component['ngOnInit']();

    expect(component['isStatsLoading']()).toBe(true);
    expect(userServiceMock.statsGetAll).not.toHaveBeenCalled();
  });
});
