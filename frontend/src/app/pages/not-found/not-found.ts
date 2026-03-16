import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppRoute, getRoutePath } from '../../app.routes';

@Component({
  selector: 'app-not-found',
  imports: [TranslocoDirective, TuiButton],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NotFound {
  private readonly router = inject(Router);
  public goHome(): void {
    this.router.navigate([getRoutePath(AppRoute.MAIN)]);
  }
}
