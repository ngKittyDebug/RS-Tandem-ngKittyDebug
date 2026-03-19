import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { TuiTitle } from '@taiga-ui/core';
import { TUI_FALSE_HANDLER } from '@taiga-ui/cdk';
import { TuiButton } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { map, startWith, Subject, switchMap, timer } from 'rxjs';
import { TuiElasticContainer } from '@taiga-ui/kit';

@Component({
  selector: 'app-hangman',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslocoDirective,
    TuiTitle,
    AsyncPipe,
    TuiButton,
    TuiButtonLoading,
    TuiElasticContainer,
  ],
  templateUrl: './hangman.html',
  styleUrl: './hangman.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hangman {
  private router = inject(Router);
  protected mainRouterPath = getRoutePath(AppRoute.MAIN);
  protected readonly trigger$ = new Subject<void>();
  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() => timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))),
  );
}
