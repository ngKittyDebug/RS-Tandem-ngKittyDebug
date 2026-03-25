import { FormControl } from '@angular/forms';

export interface DecryptoForm {
  code1: FormControl<number | null>;
  code2: FormControl<number | null>;
  code3: FormControl<number | null>;
  hint1: FormControl<string>;
  hint2: FormControl<string>;
  hint3: FormControl<string>;
}
