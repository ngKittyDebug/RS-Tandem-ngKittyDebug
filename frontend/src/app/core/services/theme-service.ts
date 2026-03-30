import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../../shared/constants/storage-constants';
import { ThemeNames } from '../../shared/enums/theme-names.enum';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private baseTheme =
    inject(DOCUMENT).defaultView?.localStorage.getItem(STORAGE_KEYS.THEME) || ThemeNames.Light;
  public readonly theme = signal(this.baseTheme);

  public changeTheme(): void {
    this.theme.update((t) => (t === ThemeNames.Light ? ThemeNames.Dark : ThemeNames.Light));
    localStorage.setItem(STORAGE_KEYS.THEME, this.theme());
  }
}
