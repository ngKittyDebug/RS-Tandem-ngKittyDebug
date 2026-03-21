import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { RouterModule } from '@angular/router';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { EyeCompassDirective } from '../../../core/directive/eye-compass.directive';
import { TuiMessage, TuiDataListWrapper, TuiTextarea } from '@taiga-ui/kit';
import { TuiTextfield, TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-cities-game',
  templateUrl: './cities-game.html',
  styleUrls: ['./cities-game.scss'],
  imports: [
    RouterModule,
    TranslocoModule,
    EyeCompassDirective,
    TuiMessage,
    TuiDataListWrapper,
    TuiTextfield,
    TuiTextarea,
    TuiButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesGame {
  protected citiesRouterPath = getRoutePath(AppRoute.CITIES_GAME);
  private translocoService = inject(TranslocoService);
  public t(key: string): string {
    return this.translocoService.translate(key);
  }
}
