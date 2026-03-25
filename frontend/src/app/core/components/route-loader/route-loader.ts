import { Component, inject } from '@angular/core';
import { RouteLoaderService } from '../../services/route-loader/route-loader-service';
import { Loader } from '../loader/loader';

@Component({
  selector: 'app-route-loader',
  imports: [Loader],
  templateUrl: './route-loader.html',
  styleUrl: './route-loader.scss',
})
export class RouteLoader {
  protected readonly routeLoaderService = inject(RouteLoaderService);
}
