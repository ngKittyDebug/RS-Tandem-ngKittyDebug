import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-main',
  imports: [TranslocoDirective],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}
