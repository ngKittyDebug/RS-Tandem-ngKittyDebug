import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiAvatar, TuiAvatarOutline, TuiBadge } from '@taiga-ui/kit';
import { TuiAppearance, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { UserStore } from '../../../../core/stores/user-store/user-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

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
}
