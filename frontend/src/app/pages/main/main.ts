import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiLink } from '@taiga-ui/core/components/link';

@Component({
  selector: 'app-main',
  imports: [TranslocoDirective, TuiLink],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}
