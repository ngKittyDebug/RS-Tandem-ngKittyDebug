import { inject, Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent, PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { POPUP_SIZES } from './models/popup.enum';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PopupService {
  private readonly dialogs = inject(TuiDialogService);

  public openPopup<R = void, T = object>(
    content: PolymorpheusComponent<T> | PolymorpheusContent<T>,
    label = '',
    appearance = 'flat',
    size: POPUP_SIZES = POPUP_SIZES.MEDIUM,
  ): Observable<R> {
    return this.dialogs.open<R>(content, {
      label,
      appearance,
      size,
    });
  }
}
