import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { RouterModule } from '@angular/router';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { EyeCompassDirective } from '../../../core/directive/eye-compass.directive';
import { TuiMessage, TuiDataListWrapper, TuiTextarea } from '@taiga-ui/kit';
import { TuiTextfield, TuiButton } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

interface Message {
  text: string;
  type: 'incoming' | 'outgoing';
}

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
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesGame implements OnInit {
  protected citiesRouterPath = getRoutePath(AppRoute.CITIES_GAME);
  private translocoService = inject(TranslocoService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  public t(key: string): string {
    return this.translocoService.translate(key);
  }
  public messages: Message[] = [
    { text: 'citiesGame.messageFromCat1', type: 'incoming' },
    { text: 'citiesGame.messageFromCat2', type: 'incoming' },
    { text: 'citiesGame.messageFromCat3', type: 'incoming' },
    { text: 'citiesGame.messageFromCat4', type: 'incoming' },
    { text: 'citiesGame.messageFromCat5', type: 'incoming' },
    { text: 'citiesGame.messageFromCat6', type: 'incoming' },
    { text: 'citiesGame.messageFromCat7', type: 'incoming' },
  ];
  public myMessage: string[] = [];
  public visibleMessages: Message[] = [];
  private index = 0;
  public isRunning = true;
  private timeoutId?: ReturnType<typeof setTimeout>;

  public runMessages(): void {
    if (this.index >= this.messages.length) {
      this.isRunning = false;
      return;
    }
    if (!this.isRunning) return;
    this.timeoutId = setTimeout(() => {
      this.zone.run(() => {
        this.visibleMessages.push(this.messages[this.index]);
        this.index++;
        this.cdr.markForCheck();
        this.runMessages();
      });
    }, 500);
  }
  public ngOnInit(): void {
    this.runMessages();
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

  public messageForm = this.fb.group({
    message: [''],
  });

  public sendMessege(): void {
    const { message } = this.messageForm.getRawValue();
    if (!message) return;
    const data: Message = { text: message, type: 'outgoing' };
    this.visibleMessages.push(data);
    this.messageForm.reset();
    console.log(data);
  }
}
