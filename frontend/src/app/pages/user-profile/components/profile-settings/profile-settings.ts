import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiAppearance, TuiTitle } from '@taiga-ui/core';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { PasswordForm } from './password-form/password-form';
import { AccountForm } from './account-form/account-form';

@Component({
  selector: 'app-profile-settings',
  imports: [
    TranslocoDirective,
    TuiCardLarge,
    TuiAppearance,
    ReactiveFormsModule,
    TuiHeader,
    TuiTitle,
    PasswordForm,
    AccountForm,
  ],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettings {}
