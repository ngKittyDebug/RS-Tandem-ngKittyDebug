import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLike } from '@taiga-ui/kit';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [FormsModule, TuiLike],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  protected readonly themeService = inject(ThemeService);

  public onChange(): void {
    this.themeService.toggle();
  }
}
