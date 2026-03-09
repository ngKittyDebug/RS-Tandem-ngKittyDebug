import { TuiRoot } from '@taiga-ui/core';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { ThemeService } from './core/services/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly themeService = inject(ThemeService);
}
