import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiHeader } from '@taiga-ui/layout';
import { ProfileSidebar } from './components/profile-sidebar/profile-sidebar';
import { RecentActivity } from './components/recent-activity/recent-activity';
import { UserStore } from '../../core/stores/user-store/user-store';
import { ProfileSettings } from './components/profile-settings/profile-settings';
import { UserService } from '../../core/services/user/user-service';
import { StatsResponseData } from '../../core/services/user/models/user.interfaces';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AppTosterService } from '../../core/services/app-toster-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Loader } from '../../core/components/loader/loader';

@Component({
  selector: 'app-user-profile',
  imports: [TranslocoDirective, TuiHeader, ProfileSidebar, RecentActivity, ProfileSettings, Loader],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly userService = inject(UserService);
  private readonly transloco = inject(TranslocoService);
  private readonly toast = inject(AppTosterService);
  protected readonly userStore = inject(UserStore);

  protected readonly stats = signal<StatsResponseData[] | []>([]);
  protected readonly isStatsLoading = signal<boolean>(false);

  public ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    if (this.isStatsLoading()) {
      return;
    }

    this.isStatsLoading.set(true);

    this.userService
      .statsGetAll()
      .pipe(
        tap((stats) => {
          this.stats.set(stats);
        }),
        catchError((error) => {
          this.stats.set([]);

          let message = this.transloco.translate('serverResponse.statistics.defaultError');

          if (error.status === 401) {
            message = this.transloco.translate('serverResponse.statistics.notAuthUser');
          } else if (error.status === 404) {
            message = this.transloco.translate('serverResponse.statistics.statisticsNotFound');
          }

          this.toast.showErrorToster(message);

          return EMPTY;
        }),
        finalize(() => {
          this.isStatsLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
