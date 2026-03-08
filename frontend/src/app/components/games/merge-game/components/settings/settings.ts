import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiIcon, TuiSurface } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameMode, PersonalityMode, QuestionMode } from '../../models/settings.type';

@Component({
  selector: 'app-settings',
  imports: [
    TranslocoDirective,
    TuiButton,
    TuiCardLarge,
    TuiHeader,
    TuiSurface,
    FormsModule,
    TuiIcon,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  protected gameMode = signal<GameMode>('no');
  protected personalityMode = signal<PersonalityMode>('neutral');
  protected questionMode = signal<QuestionMode>(1);

  protected readonly gameModes: GameMode[] = ['yes', 'no'];
  protected readonly personalityModes: PersonalityMode[] = ['neutral', 'kind', 'strict'];
  protected readonly questionModes: QuestionMode[] = [1, 2, 3, 4, 5];

  protected switchGameMode(mode: GameMode): void {
    this.gameMode.set(mode);
  }

  protected switchPersonalityMode(mode: PersonalityMode): void {
    this.personalityMode.set(mode);
  }

  protected switchQuestionMode(mode: QuestionMode): void {
    this.questionMode.set(mode);
  }
}
