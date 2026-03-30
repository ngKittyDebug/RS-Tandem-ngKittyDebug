import { Component, input } from '@angular/core';
import { AiData } from '../../cards/github';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiAvatar, TuiBadge } from '@taiga-ui/kit';

@Component({
  selector: 'app-ai-cards',
  imports: [TranslocoDirective, TuiAvatar, TuiBadge],
  templateUrl: './ai-cards.html',
  styleUrl: './ai-cards.scss',
})
export class AiCards {
  public readonly aiSignal = input.required<AiData>();
}
