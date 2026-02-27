import { Component } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { LaguageSwitcher } from '../../../core/components/laguage-switcher/laguage-switcher';
import { ThemeSwitcher } from '../../components/theme-switcher/theme-switcher';
import { TuiAppearance } from '@taiga-ui/core';

@Component({
  selector: 'app-header',
  imports: [TuiHeader, TuiAppearance, LaguageSwitcher, ThemeSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
