import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-registration',
  imports: [TranslocoDirective],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {}
