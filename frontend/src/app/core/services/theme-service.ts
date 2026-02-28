import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../../shared/constants/storage-constants';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private baseTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  public readonly theme = signal(this.baseTheme);

  public changeTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
    localStorage.setItem(STORAGE_KEYS.THEME, this.theme());
  }
}
