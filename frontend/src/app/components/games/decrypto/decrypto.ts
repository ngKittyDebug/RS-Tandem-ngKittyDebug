import { Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiButton, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { GameCards } from './models/decrypto-cards.constants';
import { Card } from './models/decrypto-card.interface';
import { TuiInputNumber } from '@taiga-ui/kit';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecryptoForm } from './models/decrypto-form.interface';

@Component({
  selector: 'app-decrypto',
  imports: [
    ReactiveFormsModule,
    TuiInputNumber,
    TuiTextfield,
    TuiNumberFormat,
    TuiButton,
    TranslocoDirective,
  ],
  templateUrl: './decrypto.html',
  styleUrl: './decrypto.scss',
})
export class Decrypto {
  public gameCards: Card[] = GameCards.slice(0, 4);

  private fb = inject(FormBuilder);

  public readonly decryptoForm = this.fb.nonNullable.group<DecryptoForm>({
    code1: this.fb.nonNullable.control(null, [Validators.required]),
    code2: this.fb.nonNullable.control(null, [Validators.required]),
    code3: this.fb.nonNullable.control(null, [Validators.required]),
    hint1: this.fb.nonNullable.control('bla bla bla', [Validators.required]),
    hint2: this.fb.nonNullable.control('bla bla', [Validators.required]),
    hint3: this.fb.nonNullable.control('bla', [Validators.required]),
  });
}
