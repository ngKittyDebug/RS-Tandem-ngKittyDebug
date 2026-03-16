import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiAppearance, TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-profile-stats',
  imports: [TranslocoDirective, TuiCardLarge, TuiAppearance, TuiHeader, TuiIcon, TuiBadge],
  templateUrl: './profile-stats.html',
  styleUrl: './profile-stats.scss',
})
export class ProfileStats {}
