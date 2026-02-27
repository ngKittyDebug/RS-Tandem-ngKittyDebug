import { Component } from '@angular/core';
import { TuiHeader } from '@taiga-ui/layout';
import { LaguageSwitcher } from '../../../core/components/laguage-switcher/laguage-switcher';
import { ThemeSwitcher } from '../../components/theme-switcher/theme-switcher';

@Component({
  selector: 'app-header',
  imports: [TuiHeader, LaguageSwitcher, ThemeSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
