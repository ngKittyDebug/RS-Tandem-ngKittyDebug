import { TestBed } from '@angular/core/testing';

import { UserStore } from './user-store';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { UserService } from '../../services/user/user-service';
import { AppTosterService } from '../../services/app-toster-service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('UserStore', () => {
  let service: UserStore;
  let transloco: TranslocoService;

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

  const fullUser = {
    username: 'user',
    email: 'user@test.com',
    avatar: 'avatar.jpg',
    createdAt: '2026-03-14T00:00:00Z',
    provider: 'local',
    providerId: null,
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
    transloco = TestBed.inject(TranslocoService);
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

  it('should load user successfully', async () => {
    userServiceMock.getUser.mockReturnValue(of(fullUser));

    await service.loadUser();

    expect(service.user()).toEqual(fullUser);
    expect(service.isLoading()).toBe(false);
  });

  it('should show unauthorized error when loadUser fails with 401', async () => {
    userServiceMock.getUser.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );

    await service.loadUser();

    expect(service.user()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(toasterMock.showErrorToster).toHaveBeenCalledWith(
      transloco.translate('serverResponse.getUser.unauthorized'),
    );
  });

  it('should update user and preserve untouched fields', async () => {
    userServiceMock.getUser.mockReturnValue(of(fullUser));
    await service.loadUser();

    userServiceMock.updateUser.mockReturnValue(
      of({
        username: 'new-user',
        email: 'new@test.com',
      }),
    );

    const result = await service.updateUser({
      username: 'new-user',
      email: 'new@test.com',
      password: 'Password123',
    });

    expect(result).toBe(true);
    expect(service.user()).toEqual({
      ...fullUser,
      username: 'new-user',
      email: 'new@test.com',
    });
    expect(toasterMock.showPositiveToster).toHaveBeenCalledWith(
      transloco.translate('serverResponse.updateAccount.success'),
    );
  });

  it('should return false when updateUser fails', async () => {
    userServiceMock.updateUser.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );

    const result = await service.updateUser({
      username: 'new-user',
      email: 'new@test.com',
      password: 'Password123',
    });

    expect(result).toBe(false);
    expect(service.isUpdatingUser()).toBe(false);
    expect(toasterMock.showErrorToster).toHaveBeenCalledWith(
      transloco.translate('serverResponse.updateAccount.isCredentialsTaken'),
    );
  });

  it('should change password successfully', async () => {
    userServiceMock.changePassword.mockReturnValue(of(void 0));

    const result = await service.changePassword({
      oldPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
    });

    expect(result).toBe(true);
    expect(service.isChangingPassword()).toBe(false);
  });

  it('should return false when changePassword fails', async () => {
    userServiceMock.changePassword.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );

    const result = await service.changePassword({
      oldPassword: 'OldPassword123',
      newPassword: 'newpassword',
    });

    expect(result).toBe(false);
    expect(service.isChangingPassword()).toBe(false);
    expect(toasterMock.showErrorToster).toHaveBeenCalledWith(
      transloco.translate('serverResponse.updatePassword.invalidPassword'),
    );
  });

  it('should update avatar successfully', async () => {
    userServiceMock.getUser.mockReturnValue(of(fullUser));
    await service.loadUser();

    userServiceMock.updateAvatar.mockReturnValue(of({ avatar: 'new-avatar.jpg' }));

    const result = await service.updateAvatar({ avatar: 'new-avatar.jpg' });

    expect(result).toBe(true);
    expect(service.user()?.avatar).toBe('new-avatar.jpg');
    expect(service.isUpdatingAvatar()).toBe(false);
    expect(toasterMock.showPositiveToster).toHaveBeenCalledWith(
      transloco.translate('serverResponse.updateAvatar.success'),
    );
  });

  it('should clear user', async () => {
    userServiceMock.getUser.mockReturnValue(of(fullUser));
    await service.loadUser();

    service.clear();

    expect(service.user()).toBeNull();
  });
});
