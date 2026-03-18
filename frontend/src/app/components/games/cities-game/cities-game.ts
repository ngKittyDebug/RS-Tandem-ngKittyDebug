import { Component } from '@angular/core';
import { AppRoute, getRoutePath } from '../../../app.routes';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cities-game',
  imports: [RouterModule],
  templateUrl: './cities-game.html',
  styleUrl: './cities-game.scss',
})
export class CitiesGame {
  protected citiesRouterPath = getRoutePath(AppRoute.CITIES_GAME);
}
