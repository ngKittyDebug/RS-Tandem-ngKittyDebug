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
import { CardDescription } from './models/decrypto-card.interface';
import { Timer } from '../../timer/timer';
import { DecryptoCardsLoadService } from './services/decrypto-cards-load-service';
import { POPUP_SIZES } from '../../../core/services/popup/models/popup.enum';
import { TIMER_MODE } from '../../timer/models/timer-mode.enum';
import { CONFIG } from './services/models/decrypto.constants';

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
  private readonly gameLoadCardsService = inject(DecryptoCardsLoadService);

  private readonly transloco = inject(TranslocoService);
  private tosterService = inject(AppTosterService);
  private fb = inject(FormBuilder);
  protected gameStarted = signal<boolean>(false);
  private popupService = inject(PopupService);

  private timer = viewChild(Timer);
  public timerMode = TIMER_MODE.DOWN;
  public initialTime = CONFIG.gameTime;

  public ngOnInit(): void {
    this.newGame();
  }

  public readonly decryptoForm = this.fb.nonNullable.group<DecryptoForm>({
    code1: this.fb.nonNullable.control({ value: null, disabled: true }, [Validators.required]),
    code2: this.fb.nonNullable.control({ value: null, disabled: true }, [Validators.required]),
    code3: this.fb.nonNullable.control({ value: null, disabled: true }, [Validators.required]),
    hint1: this.fb.nonNullable.control('', [Validators.required]),
    hint2: this.fb.nonNullable.control('', [Validators.required]),
    hint3: this.fb.nonNullable.control('', [Validators.required]),
  });

  protected updateGameHintsInputs(): void {
    this.decryptoForm.patchValue({
      hint1: `${this.gameService.gameHints[0][this.gameService.gamePeriod() - 1]}`,
      hint2: `${this.gameService.gameHints[1][this.gameService.gamePeriod() - 1]}`,
      hint3: `${this.gameService.gameHints[2][this.gameService.gamePeriod() - 1]}`,
    });
  }

  protected enableGameCodeInputs(): void {
    this.decryptoForm.controls.code1.enable();
    this.decryptoForm.controls.code2.enable();
    this.decryptoForm.controls.code3.enable();
  }

  protected disableGameCodeInputs(): void {
    this.decryptoForm.controls.code1.disable();
    this.decryptoForm.controls.code2.disable();
    this.decryptoForm.controls.code3.disable();
  }

  protected startGame(): void {
    console.log('start game');
    this.gameService.generateCardsForGame();
    this.gameService.generateCards();
    this.gameService.generateGameHints();
    this.updateGameHintsInputs();
    this.enableGameCodeInputs();
    this.gameStarted.set(true);
    this.timer()?.start();
  }

  protected newGame(): void {
    console.log('new game');
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
    this.gameLoadCardsService.getGameData();
  }

  protected newRound(): void {
    console.log('new round');
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
    console.log('new period');
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
    console.log(cardDescription);
    console.log(cardName);
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
    this.gameService.checkResult(resultArr);
    console.log('this.gameService');
    this.disableGameCodeInputs();
    if (this.gameService.roundResult() === true) {
      console.log('win round');
      this.tosterService.showPositiveToster(
        this.transloco.translate('decrypto.decryptoWinRoundMsg'),
        this.transloco.translate('decrypto.decryptoWinRoundMsgLabel'),
      );
    } else if (this.gameService.roundResult() === false && this.gameService.gameResult() !== true) {
      this.tosterService.showWarningToster(
        this.transloco.translate('decrypto.decryptoWarningMsg'),
        this.transloco.translate('decrypto.decryptoWarningMsgLabel'),
      ); // вставить перевод
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
    }
  }

  public checkFinishedTimer(): void {
    this.tosterService.showErrorToster(
      this.transloco.translate('decrypto.decryptoErrorMsg'),
      this.transloco.translate('decrypto.decryptoErrorMsgLabel'),
    );
    this.gameService.gameResult.set(false);
    this.disableGameCodeInputs();
  }
}
