import { Component } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { ThemeSwitcher } from '../../components/theme-switcher/theme-switcher';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { LaguageSwitcher } from '../../components/language-switcher/language-switcher';
import { TuiAvatar } from '@taiga-ui/kit';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-header',
  imports: [
    TuiHeader,
    RouterLink,
    TranslocoDirective,
    TuiAppearance,
    TuiAvatar,
    TuiButton,
    LaguageSwitcher,
    ThemeSwitcher,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
