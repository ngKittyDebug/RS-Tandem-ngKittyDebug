import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-login',
  imports: [TranslocoDirective],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
