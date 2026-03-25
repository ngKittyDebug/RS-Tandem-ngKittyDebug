import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiAvatar, TuiAvatarOutline, TuiBadge } from '@taiga-ui/kit';
import { TuiAppearance, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { UserStore } from '../../../../core/stores/user-store/user-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, startWith, switchMap } from 'rxjs';
import { UserService } from '../../../../core/services/user/user-service';
import { CloudinaryService } from '../../../../core/services/cloudinary/cloudinary-service';
import { AppTosterService } from '../../../../core/services/app-toster-service';

const MAX_FILE_SIZE_KB = 500;

@Component({
  selector: 'app-profile-sidebar',
  imports: [
    TranslocoDirective,
    TuiCardLarge,
    TuiAppearance,
    TuiHeader,
    TuiAvatar,
    TuiIcon,
    TuiBadge,
    TuiButton,
    DatePipe,
    TuiAvatarOutline,
  ],
  templateUrl: './profile-sidebar.html',
  styleUrl: './profile-sidebar.scss',
})
export class ProfileSidebar {
  private readonly cloudinaryService = inject(CloudinaryService);
  protected readonly userService = inject(UserService);
  private translocoService = inject(TranslocoService);
  private toster = inject(AppTosterService);
  protected userStore = inject(UserStore);

  protected readonly isUploading = signal(false);

  protected readonly activeLang = toSignal(
    this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang())),
    { initialValue: this.translocoService.getActiveLang() },
  );

  protected onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.item(0);

    if (!file) return;

    const error = this.validateFile(file);
    if (error) {
      this.toster.showErrorToster(error);
      input.value = '';
      return;
    }

    this.isUploading.set(true);

    this.cloudinaryService
      .uploadImage(file)
      .pipe(
        switchMap(({ secure_url }) => this.userStore.updateAvatar({ avatar: secure_url })),
        finalize(() => {
          this.isUploading.set(false);
          input.value = '';
        }),
      )
      .subscribe({
        error: () => {
          this.toster.showErrorToster(
            this.translocoService.translate('userProfile.userInfo.changeAvatar.uploadFailed'),
          );
        },
      });
  }

  // TODO написать тесты и стянуть develop
  private validateFile(file: File): string | null {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSizeKb = MAX_FILE_SIZE_KB;
    const maxSizeBytes = maxSizeKb * 1024;

    if (!allowedTypes.includes(file.type)) {
      return this.translocoService.translate('userProfile.userInfo.changeAvatar.allowedTypes');
    }

    if (file.size > maxSizeBytes) {
      return `
      ${this.translocoService.translate(
        'userProfile.userInfo.changeAvatar.maxSize',
      )} ${maxSizeKb} ${this.translocoService.translate(
        'userProfile.userInfo.changeAvatar.maxSizeType',
      )}
      `;
    }

    return null;
  }
}
