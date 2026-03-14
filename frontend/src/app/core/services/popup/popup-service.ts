import { inject, Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent, PolymorpheusContent } from '@taiga-ui/polymorpheus';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private readonly dialogs = inject(TuiDialogService);

  public openPopup<T>(
    content: PolymorpheusComponent<T> | PolymorpheusContent,
    label = '',
    appearance = 'flat',
    size: 's' | 'm' | 'l' | 'auto' | 'fullscreen' = 'm',
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
