import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonSelect, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, TuiButton, TuiButtonSelect, TuiDataListWrapper, TuiSelect, TuiTextfield],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LaguageSwitcher implements OnInit {
  private transLocoService = inject(TranslocoService);

  public currentLang: string | null = null;
  public languages: string[] = [];
  protected value: string | null = null;

  public ngOnInit(): void {
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
