import { Component } from '@angular/core';
import { TuiAppearance, TuiLink } from '@taiga-ui/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { getRoutePath, AppRoute } from '../../../app.routes';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [TuiAppearance, TranslocoDirective, RouterLink, TuiLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected registerRouterPath = getRoutePath(AppRoute.ABOUT);
}
