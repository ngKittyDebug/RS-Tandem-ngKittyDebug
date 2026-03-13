import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiTitle, TuiSurface } from '@taiga-ui/core';
import { TuiLink } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiBreakpointService, TuiButton, type TuiSizeL } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { map, type Observable } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  standalone: true,
  selector: 'app-main',
  imports: [
    TranslocoDirective,
    TuiCardLarge,
    TuiHeader,
    TuiTitle,
    TuiSurface,
    TuiLink,
    AsyncPipe,
    TuiBlockStatus,
    TuiButton,
  ],
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {
  protected readonly breakpointService = inject(TuiBreakpointService);

  protected size$: Observable<TuiSizeL> = this.breakpointService.pipe(
    map((key) => (key === 'mobile' ? 'm' : 'l')),
  );
}
