import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public readonly theme = signal<'light' | 'dark'>('light');

  public toggle(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
}
