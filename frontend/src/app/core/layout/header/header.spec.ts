import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { of, throwError } from 'rxjs';
import { UserStore } from '../../stores/user-store/user-store';
import { AppTosterService } from '../../services/app-toster-service';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let translocoService: TranslocoService;

  const mockAuthService = {
    logout: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn(),
  };

  const mockTosterService = {
    showErrorToster: vi.fn(),
  };

  const mockUserStore = {
    user: signal({
      username: 'user',
      email: 'user@test.com',
      avatar: '',
      createdAt: '2026-03-14T00:00:00Z',
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Header,
        TranslocoTestingModule.forRoot({
          langs: {
            ru: {
              'serverResponse.statistics.defaultError':
                'Произошла ошибка. Пожалуйста, попробуйте позже.',
            },
          },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: UserStore, useValue: mockUserStore },
        { provide: AppTosterService, useValue: mockTosterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService);
    vi.clearAllMocks();
  });

  describe('logOutClick', () => {
    it('should call logout and navigate to main on success', () => {
      mockAuthService.logout.mockReturnValue(of(null));

      component['logOutClick']();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([getRoutePath(AppRoute.MAIN)]);
    });

    it('should show error toaster when logout fails', () => {
      mockAuthService.logout.mockReturnValue(throwError(() => new Error('API Error')));
      const translateSpy = vi.spyOn(translocoService, 'translate');

      component['logOutClick']();
      expect(translateSpy).toHaveBeenCalledWith('serverResponse.statistics.defaultError');
      expect(mockTosterService.showErrorToster).toHaveBeenCalledWith(
        'serverResponse.statistics.defaultError',
      );
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  it('should navigate to login page after calling logInClick', () => {
    component['logInClick']();
    expect(mockRouter.navigate).toHaveBeenCalledWith([getRoutePath(AppRoute.LOGIN)]);
  });

  it('should navigate to user page after calling avatarClick', () => {
    component['avatarClick']();
    expect(mockRouter.navigate).toHaveBeenCalledWith([getRoutePath(AppRoute.USER_PROFILE)]);
  });
});
