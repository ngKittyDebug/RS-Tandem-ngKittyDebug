import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiAppearance, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-recent-activity',
  imports: [TranslocoDirective, TuiIcon, TuiCardLarge, TuiAppearance, TuiHeader, TuiIcon, TuiBadge],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss',
})
export class RecentActivity {}
