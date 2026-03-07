import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { TuiLink } from '@taiga-ui/core';

@Component({
  selector: 'app-not-found',
  imports: [TuiLink],
  standalone: true,
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly router = inject(Router);
  public goHome(): void {
    this.router.navigate(['/']);
  }
}
