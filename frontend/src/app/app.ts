import { TuiRoot } from '@taiga-ui/core';
import { Component, DOCUMENT, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { ThemeService } from './core/services/theme-service';
import { Footer } from './core/layout/footer/footer';
import { RouteLoader } from './core/components/route-loader/route-loader';
import { AuthService } from './core/services/auth/auth-service';
import { UserStore } from './core/stores/user-store/user-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, Header, Footer, RouteLoader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);
  private readonly onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      this.revalidateAuth();
    }
  };

  public ngOnInit(): void {
    this.document.defaultView?.addEventListener('pageshow', this.onPageShow);
  }

  public ngOnDestroy(): void {
    this.document.defaultView?.removeEventListener('pageshow', this.onPageShow);
  }

  private revalidateAuth(): void {
    this.authService.refresh().subscribe({
      next: () => {
        const loggedIn = this.authService.isLoggedIn();

        if (loggedIn) {
          void this.userStore.loadUser();
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        console.warn('[OAuth-Debug] bfcache revalidation failed:', err.status ?? err.message);
      },
    });
  }
}
