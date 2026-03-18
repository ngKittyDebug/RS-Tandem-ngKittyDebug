import { inject, Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent, PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { POPUP_SIZES } from './models/popup.enum';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private readonly dialogs = inject(TuiDialogService);

  public openPopup<T>(
    content: PolymorpheusComponent<T> | PolymorpheusContent,
    label = '',
    appearance = 'flat',
    size: POPUP_SIZES = POPUP_SIZES.MEDIUM,
  ): void {
    this.dialogs
      .open(content, {
        label,
        appearance,
        size,
      })
      .subscribe();
  }
}
