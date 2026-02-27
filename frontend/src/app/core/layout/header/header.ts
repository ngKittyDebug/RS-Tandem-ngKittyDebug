import { Component } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { LaguageSwitcher } from '../../../core/components/laguage-switcher/laguage-switcher';
import { ThemeSwitcher } from '../../components/theme-switcher/theme-switcher';
import { TuiAppearance } from '@taiga-ui/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [TuiHeader, RouterLink, TuiAppearance, LaguageSwitcher, ThemeSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
