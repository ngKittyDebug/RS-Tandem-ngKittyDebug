import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  @Output() public back = new EventEmitter<void>();
  @Output() public results = new EventEmitter<void>();
}
