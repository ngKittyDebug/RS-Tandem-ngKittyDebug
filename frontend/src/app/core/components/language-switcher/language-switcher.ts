import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonSelect, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { TranslocoService } from '@jsverse/transloco';
import { inject } from '@angular/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, TuiButton, TuiButtonSelect, TuiDataListWrapper, TuiSelect, TuiTextfield],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
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

    this.languages = availableLangs.map((lang) => {
      return typeof lang === 'string' ? lang : lang.id;
    });
  }

  public onChangeLanguage(event: string): void {
    this.transLocoService.setActiveLang(event);
    this.currentLang = event;
  }
}
