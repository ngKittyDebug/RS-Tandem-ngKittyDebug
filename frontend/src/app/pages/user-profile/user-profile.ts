import { Component, inject, OnInit } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiHeader } from '@taiga-ui/layout';
import { ProfileSidebar } from './components/profile-sidebar/profile-sidebar';
import { ProfileStats } from './components/profile-stats/profile-stats';
import { RecentActivity } from './components/recent-activity/recent-activity';
import { UserStore } from '../../core/stores/user-store/user-store';
import { ProfileSettings } from './components/profile-settings/profile-settings';

@Component({
  selector: 'app-user-profile',
  imports: [
    TranslocoDirective,
    TuiHeader,
    ProfileSidebar,
    ProfileStats,
    RecentActivity,
    ProfileSettings,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  protected readonly userStore = inject(UserStore);

  public ngOnInit(): void {
    this.userStore.loadUser();
  }
}
