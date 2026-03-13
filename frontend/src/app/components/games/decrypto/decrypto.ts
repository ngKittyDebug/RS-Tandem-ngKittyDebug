import { Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiInputNumber } from '@taiga-ui/kit';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecryptoForm } from './models/decrypto-form.interface';
import { DecryptoGameService } from './services/decrypto-game-service';

@Component({
  selector: 'app-decrypto',
  imports: [ReactiveFormsModule, TuiInputNumber, TuiTextfield, TuiButton, TranslocoDirective],
  templateUrl: './decrypto.html',
  styleUrl: './decrypto.scss',
})
export class Decrypto {
  protected readonly gameService = inject(DecryptoGameService);
  private fb = inject(FormBuilder);

  public readonly decryptoForm = this.fb.nonNullable.group<DecryptoForm>({
    code1: this.fb.nonNullable.control(null, [Validators.required]),
    code2: this.fb.nonNullable.control(null, [Validators.required]),
    code3: this.fb.nonNullable.control(null, [Validators.required]),
    hint1: this.fb.nonNullable.control('...', [Validators.required]),
    hint2: this.fb.nonNullable.control('...', [Validators.required]),
    hint3: this.fb.nonNullable.control('...', [Validators.required]),
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
    console.log(this.gameService.gameHints);
  }

  protected newGame(): void {
    console.log('new game');
    this.gameService.generateWrightCode();
    this.gameService.resetGameCards();
    this.gameService.resetGameHints();
    this.decryptoForm.reset();
  }

  protected openRules(): void {
    console.log('rules');
  }
}
