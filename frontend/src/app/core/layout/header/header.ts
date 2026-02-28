import { Component } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { ThemeSwitcher } from '../../components/theme-switcher/theme-switcher';
import { TuiAppearance } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';
import { LaguageSwitcher } from '../../components/language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [TuiHeader, RouterLink, TuiAppearance, LaguageSwitcher, ThemeSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
