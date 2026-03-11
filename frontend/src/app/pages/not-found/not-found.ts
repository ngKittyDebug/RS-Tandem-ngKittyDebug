import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  imports: [TranslocoDirective],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {}
