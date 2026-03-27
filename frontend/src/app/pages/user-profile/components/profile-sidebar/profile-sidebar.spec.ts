import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';

import { ProfileSidebar } from './profile-sidebar';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { UserStore } from '../../../../core/stores/user-store/user-store';
import { signal } from '@angular/core';
import { AppTosterService } from '../../../../core/services/app-toster-service';
import { CloudinaryService } from '../../../../core/services/cloudinary/cloudinary-service';
import { throwError } from 'rxjs';

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
    updateAvatar: vi.fn(),
  };

  const tosterMock = {
    showErrorToster: vi.fn(),
  };

  const cloudinaryServiceMock = {
    uploadImage: vi.fn(),
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
      providers: [
        { provide: UserStore, useValue: userStoreMock },
        { provide: AppTosterService, useValue: tosterMock },
        { provide: CloudinaryService, useValue: cloudinaryServiceMock },
      ],
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

  it('should render fallback avatar when user has no avatar', () => {
    const avatarImg = fixture.nativeElement.querySelector('img');

    expect(avatarImg?.getAttribute('src')).toBe('assets/images/cat-1.png');
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

  it('should disable upload button while avatar is updationg or loading', () => {
    const button = fixture.nativeElement.querySelector('.avatar__button');

    expect(button.disabled).toBe(false);

    component['isAvatarUpdating'].set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);

    component['isAvatarUpdating'].set(false);
    component['isAvatarImageLoading'].set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });

  it('should show error toaster for invalid file type', () => {
    const file = new File(['avatar'], 'avatar.gif', { type: 'image/gif' });
    const input = fixture.nativeElement.querySelector('input[type="file"]');

    Object.defineProperty(input, 'files', {
      value: {
        item: () => file,
      },
    });

    component['onFileSelected'](input);
    expect(tosterMock.showErrorToster).toHaveBeenCalledWith(
      transloco.translate('userProfile.userInfo.changeAvatar.allowedTypes'),
    );
    expect(input.value).toBe('');
  });

  it('should show uploadFailed toaster when uploadImage fails', () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = fixture.nativeElement.querySelector('input[type="file"]');

    Object.defineProperty(input, 'files', {
      value: { item: () => file },
    });

    cloudinaryServiceMock.uploadImage.mockReturnValue(throwError(() => new Error('upload failed')));

    component['onFileSelected'](input);

    expect(userStoreMock.updateAvatar).not.toHaveBeenCalled();
    expect(component['isAvatarUpdating']()).toBe(false);
    expect(component['isAvatarImageLoading']()).toBe(false);
    expect(tosterMock.showErrorToster).toHaveBeenCalledWith(
      transloco.translate('userProfile.userInfo.changeAvatar.uploadFailed'),
    );
    expect(input.value).toBe('');
  });

  it('should stop image loading on image error event', () => {
    component['isAvatarImageLoading'].set(true);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(component['isAvatarImageLoading']()).toBe(false);
  });

  it('should call file input click when avatar button is clicked', () => {
    const button = fixture.nativeElement.querySelector('.avatar__button');
    const input = fixture.nativeElement.querySelector('input[type="file"]');

    const clickSpy = vi.spyOn(input, 'click');
    button.click();
    expect(clickSpy).toHaveBeenCalled();
  });
});
