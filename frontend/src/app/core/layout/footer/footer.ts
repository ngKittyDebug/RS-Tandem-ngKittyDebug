import { Component } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  imports: [TuiAppearance, TranslocoDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}
