import { Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiAvatar, TuiAvatarOutline, TuiBadge, TuiSkeleton } from '@taiga-ui/kit';
import { TuiAppearance, TuiButton, TuiDialog, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { UserStore } from '../../../../core/stores/user-store/user-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, startWith, switchMap } from 'rxjs';
import { CloudinaryService } from '../../../../core/services/cloudinary/cloudinary-service';
import { AppTosterService } from '../../../../core/services/app-toster-service';
import { StatsResponseData } from '../../../../core/services/user/models/user.interfaces';
import { GAME_LABEL_TRANSLATION_KEYS } from '../../../../shared/constants/game.constants';
import { getListItemVariant } from '../../utils/list-item-variant.util';

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
    TuiSkeleton,
    TuiDialog,
    TuiTitle,
    TuiHeader,
  ],
  templateUrl: './profile-sidebar.html',
  styleUrl: './profile-sidebar.scss',
})
export class ProfileSidebar {
  private readonly cloudinaryService = inject(CloudinaryService);
  private translocoService = inject(TranslocoService);
  private toster = inject(AppTosterService);
  protected userStore = inject(UserStore);
  protected readonly gameTitleKeys = GAME_LABEL_TRANSLATION_KEYS;
  protected readonly getListItemVarian = getListItemVariant;
  public readonly stats = input<StatsResponseData[] | []>([]);
  protected readonly openDialog = signal(false);

  protected readonly isAvatarUpdating = signal(false);
  protected readonly isAvatarImageLoading = signal(false);

  protected readonly gamePlayed = computed(() => {
    return this.stats().reduce((acc, stat) => acc + stat.playedCount, 0);
  });

  protected readonly isStats = computed(() => this.stats().length > 0);

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

    this.isAvatarUpdating.set(true);

    this.cloudinaryService
      .uploadImage(file)
      .pipe(
        switchMap(({ secure_url }) => {
          this.isAvatarImageLoading.set(true);
          return this.userStore.updateAvatar({ avatar: secure_url });
        }),
        finalize(() => {
          this.isAvatarUpdating.set(false);
          input.value = '';
        }),
      )
      .subscribe({
        next: (success) => {
          if (!success) {
            this.isAvatarImageLoading.set(false);
          }
        },
        error: () => {
          this.isAvatarImageLoading.set(false);
          this.toster.showErrorToster(
            this.translocoService.translate('userProfile.userInfo.changeAvatar.uploadFailed'),
          );
        },
      });
  }

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
