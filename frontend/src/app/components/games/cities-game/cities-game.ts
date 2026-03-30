import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { Router } from '@angular/router';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { EyeCompassDirective } from '../../../core/directive/eye-compass.directive';
import {
  TuiMessage,
  TuiTextarea,
  TuiAvatar,
  TuiAvatarOutline,
  TuiSkeleton,
  TuiTooltip,
} from '@taiga-ui/kit';
import { TuiTextfield, TuiButton, TuiIcon } from '@taiga-ui/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';
import { interval, map, startWith } from 'rxjs';
import { Timer } from '../../timer/timer';
import { TIMER_MODE } from '../../timer/models/timer-mode.enum';
import { UserStore } from '../../../core/stores/user-store/user-store';
import { UserService } from '../../../core/services/user/user-service';
import { GameLabels } from '../../../shared/enums/game-labels.enum';

interface Message {
  text: string;
  type: 'incoming' | 'outgoing' | 'incomingSad';
  word?: Word;
}
export interface CitiesGameStorage {
  words: Word[];
}
export interface Word {
  word: string;
  wordDescription?: WordDescription;
}

export interface WordDescription {
  en: string;
  ru: string;
}
export interface CitiesGameVocabularResponse {
  id: string;
  key: string;
  storage: CitiesGameStorage;
}

@Component({
  selector: 'app-cities-game',
  templateUrl: './cities-game.html',
  styleUrls: ['./cities-game.scss'],
  imports: [
    TranslocoModule,
    TuiMessage,
    TuiTextfield,
    TuiTextarea,
    TuiButton,
    CommonModule,
    EyeCompassDirective,
    ReactiveFormsModule,
    TuiIcon,
    TuiTooltip,
    Timer,
    TuiAvatar,
    TuiAvatarOutline,
    TuiSkeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesGame implements OnInit {
  protected isLoading$ = interval(2000).pipe(
    map((i) => Boolean(i % 2)),
    startWith(true),
  );
  protected readonly loadDataServise = inject(KeyStorageService<CitiesGameStorage>);
  private readonly userService = inject(UserService);
  protected citiesRouterPath = getRoutePath(AppRoute.CITIES_GAME);
  private translocoService = inject(TranslocoService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  public messages: Message[] = [
    { text: 'citiesGame.messageFromCat1', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat2', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat3', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat4', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat5', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat6', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat7', type: 'incomingSad' },
    { text: 'citiesGame.messageFromCat8', type: 'incomingSad' },
  ];

  public visibleMessages: Message[] = [];
  private index = 0;
  public isRunning = true;
  private timeoutId?: ReturnType<typeof setTimeout>;
  public words: Word[] = [];
  public usedWords: string[] = ['frontend'];
  private timer = viewChild(Timer);
  public timerMode = TIMER_MODE.UP;
  protected readonly isAvatarUpdating = signal(false);
  protected readonly isAvatarImageLoading = signal(false);
  protected userStore = inject(UserStore);
  public userName = '';
  private bottom = viewChild<ElementRef>('bottom');
  private readonly router = inject(Router);

  private scrollToBottom(): void {
    this.bottom()?.nativeElement?.scrollIntoView?.({ behavior: 'smooth' });
  }
  public runMessages(): void {
    this.timer()?.start();
    if (this.index >= this.messages.length) {
      this.isRunning = false;
      return;
    }
    if (!this.isRunning) return;
    this.timeoutId = setTimeout(() => {
      this.zone.run(() => {
        this.visibleMessages.push(this.messages[this.index]);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.scrollToBottom();
        });
        this.index++;
        this.cdr.markForCheck();
        this.runMessages();
      });
    }, 1000);
  }

  public ngOnInit(): void {
    this.loadDataServise
      .getData({
        key: 'citiesGameVocabular',
      })
      .subscribe((response) => {
        this.words = response.storage.words;
        this.cdr.markForCheck();
      });
    this.userService.getUser().subscribe((user) => {
      this.userName = user.username;
    });
    this.runMessages();
  }

  public messageForm = this.fb.group({
    message: [''],
  });

  public lastLatterFromCat = 'd';

  public sasarikScript(message: string): void {
    const isFirstLetterOk = message.toLowerCase().trim()[0] === this.lastLatterFromCat;
    const index = this.words.findIndex(
      (word) => word.word.toLowerCase().trim() === message.toLowerCase().trim(),
    );
    const used = this.usedWords.indexOf(message.toLowerCase().trim());
    const isFound = index !== -1;
    const isUsed = used !== -1;

    const lastLetterMessage = message[message.length - 1];
    const nextWordFromCat: number = this.words.findIndex((word) => {
      return (
        word.word.toLowerCase()[0] === lastLetterMessage.toLowerCase() &&
        !this.usedWords.includes(word.word.toLowerCase())
      );
    });
    let state: 'win' | 'not_found' | 'used' | 'wrong_letter' | 'ok' | 'out';
    if (this.usedWords.length >= 14) {
      state = 'win';
    } else if (isUsed) {
      state = 'used';
    } else if (!isFirstLetterOk) {
      state = 'wrong_letter';
    } else if (!isFound) {
      state = 'not_found';
    } else if (nextWordFromCat === -1) {
      state = 'out';
    } else {
      state = 'ok';
    }

    switch (state) {
      case 'win':
        this.timeoutId = setTimeout(() => {
          this.zone.run(() => {
            this.visibleMessages.push({
              text: 'citiesGame.sasarikSadWin',
              type: 'incomingSad',
            });
            this.cdr.markForCheck();
            setTimeout(() => {
              this.scrollToBottom();
            });
          });
        }, 1000);
        break;
      case 'used':
        this.timeoutId = setTimeout(() => {
          this.zone.run(() => {
            this.visibleMessages.push({
              text: 'citiesGame.sasarikSadUsed',
              type: 'incomingSad',
            });
            this.cdr.markForCheck();
            setTimeout(() => {
              this.scrollToBottom();
            });
          });
        }, 1000);
        break;

      case 'wrong_letter':
        this.timeoutId = setTimeout(() => {
          this.zone.run(() => {
            this.visibleMessages.push({
              text: 'citiesGame.sasarikSadWrongLetter',
              type: 'incomingSad',
            });
            this.cdr.markForCheck();
            setTimeout(() => {
              this.scrollToBottom();
            });
          });
        }, 1000);
        break;

      case 'ok': {
        const word = this.words[nextWordFromCat];
        const nextMessageFromCat: Message = {
          text: this.words[nextWordFromCat].word,
          type: 'incoming',
          word,
        };
        this.timeoutId = setTimeout(() => {
          this.zone.run(() => {
            this.visibleMessages.push(nextMessageFromCat);
            this.cdr.markForCheck();
            setTimeout(() => {
              this.scrollToBottom();
            });
          });
        }, 1000);
        this.usedWords.push(message.toLowerCase());
        this.usedWords.push(nextMessageFromCat.text.toLowerCase());
        this.lastLatterFromCat = nextMessageFromCat.text[nextMessageFromCat.text.length - 1];
        break;
      }

      case 'out':
        this.userService.statsUpdate(GameLabels.CitiesGame).subscribe({});
        this.timeoutId = setTimeout(() => {
          this.zone.run(() => {
            this.visibleMessages.push({
              text: 'citiesGame.sasarikSadEnd',
              type: 'incomingSad',
            });
            this.cdr.markForCheck();
            setTimeout(() => {
              this.scrollToBottom();
            });
          });
        }, 1000);
        break;

      case 'not_found':
        this.timeoutId = setTimeout(() => {
          this.zone.run(() => {
            this.visibleMessages.push({
              text: 'citiesGame.sasarikSadNotFound',
              type: 'incomingSad',
            });
            this.cdr.markForCheck();
            setTimeout(() => {
              this.scrollToBottom();
            });
          });
        }, 1000);
        break;
    }
  }
  public sendMessege(): void {
    const { message } = this.messageForm.getRawValue();
    if (!message) return;
    const word = this.words.find(
      (w) => w.word.toLowerCase().trim() === message.toLowerCase().trim(),
    );
    const data: Message = { text: message, type: 'outgoing', word };
    this.visibleMessages.push(data);
    setTimeout(() => {
      this.scrollToBottom();
    });
    this.messageForm.reset();
    this.sasarikScript(message.toLowerCase());
  }
  public restart(): void {
    this.timer()?.reset();
    this.visibleMessages = [];
    this.usedWords = ['frontend'];
    this.index = 0;
    this.isRunning = true;
    this.lastLatterFromCat = 'd';
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.runMessages();
  }
  public main(): void {
    this.timer()?.reset();
    this.timer()?.stop();
    this.visibleMessages = [];
    this.usedWords = ['frontend'];
    this.index = 0;
    this.isRunning = true;
    this.lastLatterFromCat = 'd';
    this.router.navigate([getRoutePath(AppRoute.MAIN)]);
  }

  public getTooltip(message: Message): string {
    if (!message.word?.wordDescription) {
      return this.translocoService.translate('citiesGame.noTooltip');
    }

    const lang = this.translocoService.getActiveLang();

    return lang === 'ru' ? message.word.wordDescription.ru : message.word.wordDescription.en;
  }
}
