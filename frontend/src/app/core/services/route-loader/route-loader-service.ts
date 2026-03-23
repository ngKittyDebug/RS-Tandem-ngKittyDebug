import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { filter, map, scan, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteLoaderService {
  private readonly router = inject(Router);

  private readonly pendingLoads = toSignal(
    this.router.events.pipe(
      filter(
        (event): event is RouteConfigLoadStart | RouteConfigLoadEnd =>
          event instanceof RouteConfigLoadStart || event instanceof RouteConfigLoadEnd,
      ),
      map((event) => (event instanceof RouteConfigLoadStart ? 1 : -1)),
      scan((count, delta) => Math.max(0, count + delta), 0),
      startWith(0),
    ),
    { initialValue: 0 },
  );

  public readonly isLoading = computed(() => this.pendingLoads() > 0);
}
