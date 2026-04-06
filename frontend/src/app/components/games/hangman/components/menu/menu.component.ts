import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TranslocoDirective, TuiTitle, TuiButton],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Output() public playGame = new EventEmitter<void>();
  @Output() public back = new EventEmitter<void>();
  @Output() public results = new EventEmitter<void>();
  @Output() public main = new EventEmitter<void>();
}
