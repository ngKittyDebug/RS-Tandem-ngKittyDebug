import { Component, computed, inject, input } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiAppearance, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { StatsResponseData } from '../../../../core/services/user/models/user.interfaces';
import { RelativeDatePipe } from './relative-date.pipe';
import { GAME_LABEL_TRANSLATION_KEYS } from '../../../../shared/constants/game.constants';
import { getListItemVariant } from '../../utils/list-item-variant.util';
import { sortByDate } from '../../utils/date.util';

@Component({
  selector: 'app-recent-activity',
  imports: [
    TranslocoDirective,
    TuiIcon,
    TuiCardLarge,
    TuiAppearance,
    TuiHeader,
    TuiBadge,
    RelativeDatePipe,
  ],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss',
})
export class RecentActivity {
  protected readonly gameTitleKeys = GAME_LABEL_TRANSLATION_KEYS;
  protected readonly transloco = inject(TranslocoService);
  protected readonly getListItemVariant = getListItemVariant;
  public readonly stats = input<StatsResponseData[] | []>([]);

  protected readonly isStats = computed(() => this.stats().length > 0);

  protected readonly sortedStats = computed(() => [...this.stats()].sort(sortByDate));
}
