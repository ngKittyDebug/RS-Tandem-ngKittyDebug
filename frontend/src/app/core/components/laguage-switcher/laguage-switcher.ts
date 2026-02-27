import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonSelect, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { TranslocoService } from '@jsverse/transloco';
import { inject } from '@angular/core';

@Component({
  selector: 'app-laguage-switcher',
  standalone: true,
  imports: [FormsModule, TuiButton, TuiButtonSelect, TuiDataListWrapper, TuiSelect, TuiTextfield],
  templateUrl: './laguage-switcher.html',
  styleUrl: './laguage-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaguageSwitcher {
  public currentLang: string;
  public readonly languages: string[];
  protected value: string | null;
  private transLocoService = inject(TranslocoService);

  constructor() {
    this.currentLang = this.transLocoService.getActiveLang();
    this.value = this.currentLang;
    const availableLangs = this.transLocoService.getAvailableLangs();

    if (Array.isArray(availableLangs) && typeof availableLangs[0] === 'string') {
      this.languages = availableLangs as string[];
    } else {
      this.languages = (availableLangs as { id: string; label: string }[]).map((lang) => lang.id);
    }
  }

  public onChange(event: string): void {
    this.transLocoService.setActiveLang(event);
    this.currentLang = event;
  }
}
