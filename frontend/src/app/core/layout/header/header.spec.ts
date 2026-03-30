import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { Header } from './header';
import { AuthService } from '../../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { of } from 'rxjs';
import { UserStore } from '../../stores/user-store/user-store';
import { signal } from '@angular/core';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  const mockAuthService = {
    logout: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn(),
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
          langs: { en: {}, ru: {} },
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go to the profile page after calling avatarClick', async () => {
    component['avatarClick']();

    expect(mockRouter.navigate).toHaveBeenCalledWith([getRoutePath(AppRoute.USER_PROFILE)]);
  });

  it('should call logout and go to the main page after calling logOutClick', () => {
    mockAuthService.logout.mockReturnValue(of(null));

    component['logOutClick']();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([getRoutePath(AppRoute.MAIN)]);
  });
});
