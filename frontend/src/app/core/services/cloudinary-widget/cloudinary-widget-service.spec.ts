import { TestBed } from '@angular/core/testing';

import { CloudinaryWidgetService } from './cloudinary-widget-service';

describe('CloudinaryWidgetService', () => {
  let service: CloudinaryWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudinaryWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
