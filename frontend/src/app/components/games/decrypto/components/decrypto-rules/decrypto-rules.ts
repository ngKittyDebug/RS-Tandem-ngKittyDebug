import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-decrypto-rules',
  imports: [],
  templateUrl: './decrypto-rules.html',
  styleUrl: './decrypto-rules.scss',
})
export class DecryptoRules {
  public readonly context = injectContext<TuiDialogContext<void>>();
}
