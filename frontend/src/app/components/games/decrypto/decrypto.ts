import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecryptoForm } from './models/decrypto-form.interface';
import { DecryptoGameService } from './services/decrypto-game-service';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { DecryptoRules } from './components/decrypto-rules/decrypto-rules';
import { AppTosterService } from '../../../core/services/app-toster-service';
import { PopupService } from '../../../core/services/popup/popup-service';
import { Card, CardDescription } from './models/decrypto-card.interface';
import { Timer } from '../../timer/timer';
import { POPUP_SIZES } from '../../../core/services/popup/models/popup.enum';
import { TIMER_MODE } from '../../timer/models/timer-mode.enum';
import { CONFIG } from './services/models/decrypto.constants';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';
import { keysDataOnServer } from './models/decrypto.constants';

export interface DecryptoGameData {
  gameCards: Card[];
}

const dataToServer = {
  key: keysDataOnServer.keyDataOnServer1,
  storage: { gameCards: [] },
};

@Component({
  selector: 'app-decrypto',
  imports: [
    ReactiveFormsModule,
    TuiInputNumber,
    TuiIcon,
    TuiTextfield,
    TuiButton,
    TranslocoDirective,
    Timer,
  ],
  templateUrl: './decrypto.html',
  styleUrl: './decrypto.scss',
})
export class Decrypto implements OnInit {
  protected readonly gameService = inject(DecryptoGameService);
  protected readonly loadDataServerService = inject(KeyStorageService<DecryptoGameData>);
  protected readonly transloco = inject(TranslocoService);
  protected readonly tosterService = inject(AppTosterService);
  protected readonly fb = inject(FormBuilder);
  private readonly popupService = inject(PopupService);
  protected gameStarted = signal<boolean>(false);
  private timer = viewChild(Timer);
  public timerMode = TIMER_MODE.DOWN;
  public initialTime = CONFIG.gameTime;

  public ngOnInit(): void {
    this.newGame();
    this.loadDataServerService.getData(dataToServer).subscribe((data) => {
      this.gameService.gameCardsFromServer = data.storage.gameCards;
    });
  }

  public readonly decryptoForm = this.fb.nonNullable.group<DecryptoForm>({
    code1: this.fb.nonNullable.control({ value: null, disabled: true }, [Validators.required]),
    code2: this.fb.nonNullable.control({ value: null, disabled: true }, [Validators.required]),
    code3: this.fb.nonNullable.control({ value: null, disabled: true }, [Validators.required]),
    hint1: this.fb.nonNullable.control('', [Validators.required]),
    hint2: this.fb.nonNullable.control('', [Validators.required]),
    hint3: this.fb.nonNullable.control('', [Validators.required]),
  });

  private readonly codeKeys = ['code1', 'code2', 'code3'] as const;
  private readonly hintKeys = ['hint1', 'hint2', 'hint3'] as const;

  protected updateGameHintsInputs(): void {
    const period = this.gameService.gamePeriod() - 1;
    const hints: Record<string, string> = {};

    this.hintKeys.forEach((key, i) => {
      hints[key] = `${this.gameService.gameHints[i][period]}`;
    });

    this.decryptoForm.patchValue(hints);
  }

  protected toggleCodeInputs(enable: boolean): void {
    this.codeKeys.forEach((key) =>
      this.decryptoForm.controls[key][enable ? 'enable' : 'disable'](),
    );
  }

  protected enableGameCodeInputs(): void {
    this.toggleCodeInputs(true);
  }

  protected disableGameCodeInputs(): void {
    this.toggleCodeInputs(false);
  }

  protected startGame(): void {
    if (this.gameService.gameCardsFromServer.length <= CONFIG.defaultCards * CONFIG.defaultRounds) {
      const message = this.transloco.translate('decrypto.decryptoCardDataError');
      this.tosterService.showErrorToster(message);
      return;
    }
    this.gameService.generateCardsForGame();
    this.gameService.generateCards();
    this.gameService.generateGameHints();
    this.updateGameHintsInputs();
    this.enableGameCodeInputs();
    this.gameStarted.set(true);
    this.timer()?.start();
  }

  protected newGame(): void {
    if (this.gameService.gameCardsFromServer.length === 0) {
      this.loadDataServerService.getData(dataToServer).subscribe((data) => {
        this.gameService.gameCardsFromServer = data.storage.gameCards;
      });
    }
    this.gameService.generateWrightCodesForGame();
    this.gameService.generateWrightCode();
    this.gameService.resetGameCards();
    this.gameService.resetGameHints();
    this.decryptoForm.reset();
    this.gameStarted.set(false);
    this.gameService.gameResult.set(null);
    this.gameService.gamePeriod.set(CONFIG.startRound);
    this.gameService.gameAttempts.set(CONFIG.attempts);
    this.disableGameCodeInputs();
    this.timer()?.reset();
    console.log(this.gameStarted());
  }

  protected newRound(): void {
    this.gameService.roundResult.set(false);
    this.gameService.gamePeriod.update((current) => current + 1);
    this.gameService.resetGameCards();
    this.gameService.resetGameHints();
    this.decryptoForm.reset();
    this.gameService.generateWrightCode();
    this.gameService.generateCards();
    this.gameService.generateGameHints();
    this.updateGameHintsInputs();
    this.enableGameCodeInputs();
  }

  protected newPeriod(): void {
    this.decryptoForm.reset();
    this.updateGameHintsInputs();
  }

  protected openRules(): void {
    this.popupService.openPopup(
      new PolymorpheusComponent(DecryptoRules),
      this.transloco.translate('decrypto.gameRulesLabel'),
      'l',
    );
  }

  protected openCardDescription(
    cardDescription: CardDescription | undefined,
    cardName: string,
  ): void {
    const lang = this.transloco.getActiveLang();
    if (cardDescription && cardName) {
      this.popupService.openPopup(
        cardDescription[lang],
        cardName,
        'no-dialog-buttons',
        POPUP_SIZES.MEDIUM,
      );
    }
  }

  protected submitDecryptoForm(): void {
    const { code1, code2, code3 } = this.decryptoForm.getRawValue();
    const resultArr = [code1, code2, code3];
    this.gameService.checkResult(resultArr, this.timer()?.timerSeconds());
    this.disableGameCodeInputs();
    if (this.gameService.roundResult() === true) {
      this.tosterService.showPositiveToster(
        this.transloco.translate('decrypto.decryptoWinRoundMsg'),
        this.transloco.translate('decrypto.decryptoWinRoundMsgLabel'),
      );
    } else if (this.gameService.roundResult() === false && this.gameService.gameResult() !== true) {
      this.tosterService.showWarningToster(
        this.transloco.translate('decrypto.decryptoWarningMsg'),
        this.transloco.translate('decrypto.decryptoWarningMsgLabel'),
      );
      this.gameService.roundResult.set(null);
      this.enableGameCodeInputs();
      this.newPeriod();
    }
    if (this.gameService.gameResult() === false) {
      this.tosterService.showErrorToster(
        this.transloco.translate('decrypto.decryptoErrorMsg'),
        this.transloco.translate('decrypto.decryptoErrorMsgLabel'),
      );
      this.timer()?.stop();
    } else if (this.gameService.gameResult() === true) {
      this.tosterService.showPositiveToster(
        this.transloco.translate('decrypto.decryptoWinGameMsg'),
        this.transloco.translate('decrypto.decryptoWinGameMsgLabel'),
      );
      this.timer()?.stop();
    }
  }

  protected checkFinishedTimer(): void {
    this.tosterService.showErrorToster(
      this.transloco.translate('decrypto.decryptoErrorMsg'),
      this.transloco.translate('decrypto.decryptoErrorMsgLabel'),
    );
    this.gameService.gameResult.set(false);
    this.disableGameCodeInputs();
  }
}
