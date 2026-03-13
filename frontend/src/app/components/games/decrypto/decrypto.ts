import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecryptoForm } from './models/decrypto-form.interface';
import { DecryptoGameService } from './services/decrypto-game-service';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { DecryptoRules } from './components/decrypto-rules/decrypto-rules';
import { AppTosterService } from '../../../core/services/app-toster-service';

@Component({
  selector: 'app-decrypto',
  imports: [ReactiveFormsModule, TuiInputNumber, TuiTextfield, TuiButton, TranslocoDirective],
  templateUrl: './decrypto.html',
  styleUrl: './decrypto.scss',
})
export class Decrypto implements OnInit {
  protected readonly gameService = inject(DecryptoGameService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly transloco = inject(TranslocoService);
  private tosterService = inject(AppTosterService);
  private fb = inject(FormBuilder);
  protected gameStarted = signal<boolean>(false);

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

  protected startGame(): void {
    console.log('start game');
    this.gameService.generateCards();
    this.gameService.generateGameHints();
    this.decryptoForm.patchValue({
      hint1: `${this.gameService.gameHints[0].splice(0, 1)}`,
      hint2: `${this.gameService.gameHints[1].splice(0, 1)}`,
      hint3: `${this.gameService.gameHints[2].splice(0, 1)}`,
    });
    this.decryptoForm.controls.code1.enable();
    this.decryptoForm.controls.code2.enable();
    this.decryptoForm.controls.code3.enable();
    this.gameStarted.set(true);

    console.log(this.gameService.gameHints);
  }

  protected newGame(): void {
    console.log('new game');
    this.gameService.generateWrightCode();
    this.gameService.resetGameCards();
    this.gameService.resetGameHints();
    this.decryptoForm.reset();
    this.gameStarted.set(false);
    this.gameService.gameResult.set(null);
    this.gameService.gamePeriod.set(1);
    this.decryptoForm.controls.code1.disable();
    this.decryptoForm.controls.code2.disable();
    this.decryptoForm.controls.code3.disable();
  }

  protected newRound(): void {
    console.log('new round');
    this.decryptoForm.reset();
    this.decryptoForm.patchValue({
      hint1: `${this.gameService.gameHints[0].splice(0, 1)}`,
      hint2: `${this.gameService.gameHints[1].splice(0, 1)}`,
      hint3: `${this.gameService.gameHints[2].splice(0, 1)}`,
    });
  }

  protected openRules(): void {
    console.log('rules');
    this.dialogs
      .open(new PolymorpheusComponent(DecryptoRules), {
        label: this.transloco.translate('decrypto.gameRulesLabel'),
        size: 'l',
      })
      .subscribe();
  }

  protected submitDecryptoForm(): void {
    const { code1, code2, code3 } = this.decryptoForm.getRawValue();
    const resultArr = [code1, code2, code3];
    this.gameService.checkResult(resultArr);
    if (this.gameService.gameResult() === null) {
      this.newRound();
      this.tosterService.showWarningToster('You lose period. Try better');
    } else if (this.gameService.gameResult() === false) {
      this.tosterService.showErrorToster('You lose game. Try again', 'Lose');
    } else if (this.gameService.gameResult() === true) {
      this.tosterService.showPositiveToster('You win. Congratulations', 'Win');
    }
  }
}
