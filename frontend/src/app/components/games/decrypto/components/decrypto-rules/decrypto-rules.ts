import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-decrypto-rules',
  imports: [TranslocoDirective],
  templateUrl: './decrypto-rules.html',
  styleUrl: './decrypto-rules.scss',
})
export class DecryptoRules {
  public readonly context = injectContext<TuiDialogContext<void>>();
}
