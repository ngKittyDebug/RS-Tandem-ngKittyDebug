import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiAppearance, TuiButton, TuiTextfield } from '@taiga-ui/core';
import {} from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm } from '@taiga-ui/layout';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { PASSWORD_PATTERN } from 'src/app/shared/validators/password.pattern'; TODO когда Алена замержит свой компонент а я его спулю, это надо раскоментировать и проверить путь!
// import { EMAIL_PATTERN } from 'src/app/shared/validators/email.pattern'; TODO когда Алена замержит свой компонент а я его спулю, это надо раскоментировать и проверить путь!

@Component({
  selector: 'app-registration',
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss'],
  standalone: true,
  imports: [TuiTextfield, TuiButton, TuiAppearance, TuiCardLarge, TuiForm, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  public registrationForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          // Validators.pattern(EMAIL_PATTERN), TODO когда Алена замержит свой компонент а я его спулю, это надо раскоментировать  и проверить путь!
        ],
      ],
      password: [
        '',
        Validators.required,
        // Validators.pattern(PASSWORD_PATTERN), TODO когда Алена замержит свой компонент а я его спулю, это надо раскоментировать  и проверить путь!
      ],
      passwordRepeat: ['', Validators.required],
    });
  }

  public submit(): void {
    alert('Сабмит работает!');
  }
}
