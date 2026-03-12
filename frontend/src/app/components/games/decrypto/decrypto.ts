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

  protected startGame(): void {
    console.log('start game');
    this.gameService.generateCards();
  }

  protected newGame(): void {
    console.log('new game');
    this.gameService.generateWrightCode();
    this.gameService.resetGameCards();
  }

  protected openRules(): void {
    console.log('rules');
  }

  public readonly decryptoForm = this.fb.nonNullable.group<DecryptoForm>({
    code1: this.fb.nonNullable.control(null, [Validators.required]),
    code2: this.fb.nonNullable.control(null, [Validators.required]),
    code3: this.fb.nonNullable.control(null, [Validators.required]),
    hint1: this.fb.nonNullable.control('bla bla bla', [Validators.required]),
    hint2: this.fb.nonNullable.control('bla bla', [Validators.required]),
    hint3: this.fb.nonNullable.control('bla', [Validators.required]),
  });
}
