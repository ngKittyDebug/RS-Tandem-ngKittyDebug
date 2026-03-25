import { TestBed } from '@angular/core/testing';

import { RouteLoaderService } from './route-loader-service';

describe('RouteLoaderService', () => {
  let service: RouteLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
