import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'app-theme';

  private baseTheme = localStorage.getItem(this.storageKey) || 'light';
  public readonly theme = signal(this.baseTheme);

  public changeTheme(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
    localStorage.setItem(this.storageKey, this.theme());
  }
}
