import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent {
  @Output() public menu = new EventEmitter<void>();
}
