import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon, tuiIconResolverProvider } from '@taiga-ui/core';
import { TuiTitle, TuiSurface } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiBreakpointService, TuiButton, type TuiSizeL } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { map, type Observable } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { AppRoute, GameRoute, getRoutePath } from '../../app.routes';
import { AuthService } from '../../core/services/auth/auth-service';

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
  public authService = inject(AuthService);

  public breakpointService = inject(TuiBreakpointService);

  public size$: Observable<TuiSizeL> = this.breakpointService.pipe(
    map((key) => (key === 'mobile' ? 'm' : 'l')),
  );
  private readonly router = inject(Router);

  public goReg(): void {
    this.router.navigate([getRoutePath(AppRoute.LOGIN)]);
  }
  public goDecrypto(): void {
    this.router.navigate([getRoutePath(GameRoute.DECRYPTO)]);
  }
  public goHangman(): void {
    this.router.navigate([getRoutePath(GameRoute.HANGMAN)]);
  }
}
