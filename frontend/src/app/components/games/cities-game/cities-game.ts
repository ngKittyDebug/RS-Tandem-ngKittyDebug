import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
} from '@angular/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { RouterModule } from '@angular/router';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { EyeCompassDirective } from '../../../core/directive/eye-compass.directive';
import { TuiMessage, TuiDataListWrapper, TuiTextarea } from '@taiga-ui/kit';
import { TuiTextfield, TuiButton } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cities-game',
  templateUrl: './cities-game.html',
  styleUrls: ['./cities-game.scss'],
  imports: [
    RouterModule,
    TranslocoModule,
    TuiMessage,
    TuiDataListWrapper,
    TuiTextfield,
    TuiTextarea,
    TuiButton,
    CommonModule,
    EyeCompassDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesGame {
  protected citiesRouterPath = getRoutePath(AppRoute.CITIES_GAME);
  private translocoService = inject(TranslocoService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  public t(key: string): string {
    return this.translocoService.translate(key);
  }
  public messages: string[] = [
    'citiesGame.messageFromCat1',
    'citiesGame.messageFromCat2',
    'citiesGame.messageFromCat3',
    'citiesGame.messageFromCat4',
    'citiesGame.messageFromCat5',
    'citiesGame.messageFromCat6',
    'citiesGame.messageFromCat7',
  ];
  public visibleMessages: string[] = [];
  private index = 0;
  private isRunning = false;
  private timeoutId?: ReturnType<typeof setTimeout>;

  private runMessages(): void {
    if (this.index >= this.messages.length) return;
    if (!this.isRunning) return;
    this.timeoutId = setTimeout(() => {
      this.zone.run(() => {
        this.visibleMessages.push(this.messages[this.index]);
        this.index++;
        this.cdr.markForCheck();
        this.runMessages();
      });
    }, 1500);
  }

  public restart(): void {
    this.visibleMessages = [];
    this.index = 0;
    this.isRunning = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.runMessages();
  }
}
