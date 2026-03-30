import { TestBed } from '@angular/core/testing';

import { RouteLoaderService } from './route-loader-service';
import { Subject } from 'rxjs';
import { Event, Route, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';

describe('RouteLoaderService', () => {
  let service: RouteLoaderService;
  let routerEvents$: Subject<Event>;

  const route = {} as Route;

  beforeEach(() => {
    routerEvents$ = new Subject<Event>();

    TestBed.configureTestingModule({
      providers: [
        RouteLoaderService,
        {
          provide: Router,
          useValue: {
            events: routerEvents$.asObservable(),
          },
        },
      ],
    });
    service = TestBed.inject(RouteLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be false by default', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should become true on RouteConfigLoadStart', () => {
    routerEvents$.next(new RouteConfigLoadStart(route));
    expect(service.isLoading()).toBe(true);
  });

  it('should become false after RouteConfigLoadEnd', () => {
    routerEvents$.next(new RouteConfigLoadStart(route));
    routerEvents$.next(new RouteConfigLoadEnd(route));
    expect(service.isLoading()).toBe(false);
  });
});
