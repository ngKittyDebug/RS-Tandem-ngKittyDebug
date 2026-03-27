import { TestBed } from '@angular/core/testing';

import { UserStore } from './user-store';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { UserService } from '../../services/user/user-service';
import { AppTosterService } from '../../services/app-toster-service';
import { of } from 'rxjs';

describe('UserStore', () => {
  let service: UserStore;

  const userServiceMock = {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    changePassword: vi.fn(),
    updateAvatar: vi.fn(),
  };

  const toasterMock = {
    showPositiveToster: vi.fn(),
    showErrorToster: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AppTosterService, useValue: toasterMock },
      ],
    });
    service = TestBed.inject(UserStore);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should preserve avatar and createdAt when account data is updated', async () => {
    userServiceMock.getUser.mockReturnValue(
      of({
        username: 'old-user',
        email: 'old@test.com',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2026-03-14T00:00:00Z',
      }),
    );

    await service.loadUser();

    userServiceMock.updateUser.mockReturnValue(
      of({
        username: 'new-user',
        email: 'new@test.com',
      }),
    );

    const isSuccess = await service.updateUser({
      username: 'new-user',
      email: 'new@test.com',
      password: 'Password123',
    });

    expect(isSuccess).toBe(true);
    expect(service.user()).toEqual({
      username: 'new-user',
      email: 'new@test.com',
      avatar: 'https://example.com/avatar.jpg',
      createdAt: '2026-03-14T00:00:00Z',
    });
  });
});
