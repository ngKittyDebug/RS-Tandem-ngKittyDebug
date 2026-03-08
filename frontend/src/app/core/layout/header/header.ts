import { Component, inject } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { ThemeSwitcher } from '../../components/theme-switcher/theme-switcher';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { Router, RouterLink } from '@angular/router';
import { LaguageSwitcher } from '../../components/language-switcher/language-switcher';
import { TuiAvatar } from '@taiga-ui/kit';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../services/auth/auth-service';
import { AppRoute, getRoutePath } from '../../../app.routes';

@Component({
  selector: 'app-header',
  imports: [
    TuiHeader,
    RouterLink,
    TranslocoDirective,
    TuiAppearance,
    TuiAvatar,
    TuiButton,
    LaguageSwitcher,
    ThemeSwitcher,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected logOutClick(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate([getRoutePath(AppRoute.MAIN)]);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
