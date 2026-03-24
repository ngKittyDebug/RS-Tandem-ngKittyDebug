import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiAvatar, TuiAvatarOutline, TuiBadge } from '@taiga-ui/kit';
import { TuiAppearance, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { UserStore } from '../../../../core/stores/user-store/user-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, startWith, switchMap } from 'rxjs';
import { CloudinaryWidgetService } from '../../../../core/services/cloudinary-widget/cloudinary-widget-service';
import { UserService } from '../../../../core/services/user/user-service';

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
  private translocoService = inject(TranslocoService);
  protected userStore = inject(UserStore);

  protected readonly activeLang = toSignal(
    this.translocoService.langChanges$.pipe(startWith(this.translocoService.getActiveLang())),
    { initialValue: this.translocoService.getActiveLang() },
  );

  private readonly cloudinaryService = inject(CloudinaryWidgetService);
  protected readonly isUploading = signal(false);
  protected readonly userService = inject(UserService);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const error = this.validateFile(file);
    if (error) {
      console.error(error);
      input.value = '';
      return;
    }

    this.isUploading.set(true);

    this.cloudinaryService.uploadImage(file).pipe(
      switchMap((uploadResult) =>
        this.userStore.updateAvatar({
          avatar: uploadResult.secure_url,
        }),
      ),
      catchError((error) => {
        console.log(error);

        console.error(error);
        return [];
      }),
      finalize(() => {
        this.isUploading.set(false);
        input.value = '';
      }),
    );
  }

  private validateFile(file: File): string | null {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSizeKb = 500;
    const maxSizeBytes = maxSizeKb * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Допустимы только PNG, JPG, JPEG и WEBP';
    }

    if (file.size > maxSizeBytes) {
      return `Максимальный размер файла — ${maxSizeKb} КБ`;
    }

    return null;
  }
}
