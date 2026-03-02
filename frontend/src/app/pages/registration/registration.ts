import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTextfield } from '@taiga-ui/core';
import {} from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
  standalone: true,
  imports: [TuiTextfield, TuiButton, TuiAppearance, TuiCardLarge, TuiForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {}
