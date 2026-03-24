import { Component, inject, OnInit } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';
import { ProfileSidebar } from './components/profile-sidebar/profile-sidebar';
import { ProfileStats } from './components/profile-stats/profile-stats';
import { RecentActivity } from './components/recent-activity/recent-activity';
import { UserStore } from '../../core/stores/user-store/user-store';

@Component({
  selector: 'app-user-profile',
  imports: [
    TranslocoDirective,
    TuiTextfield,
    TuiHeader,
    ProfileSidebar,
    ProfileStats,
    RecentActivity,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  private readonly userStore = inject(UserStore);

  public ngOnInit(): void {
    // if (!this.userStore.user()) {
    //   void this.userStore.loadUser();
    // }
    console.log(this.userStore);
  }
}
