import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon, tuiIconResolverProvider } from '@taiga-ui/core';
import { TuiTitle, TuiSurface } from '@taiga-ui/core';
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
    TuiIcon,
    TuiTitle,
    TuiSurface,
    AsyncPipe,
    TuiBlockStatus,
    TuiButton,
  ],
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    tuiIconResolverProvider((icon) => (icon.includes('/') ? icon : `/assets/icons/${icon}.svg`)),
  ],
})
export class Main {
  protected readonly breakpointService = inject(TuiBreakpointService);

  protected size$: Observable<TuiSizeL> = this.breakpointService.pipe(
    map((key) => (key === 'mobile' ? 'm' : 'l')),
  );
}
