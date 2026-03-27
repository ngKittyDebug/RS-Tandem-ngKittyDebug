import { TestBed } from '@angular/core/testing';

import { CloudinaryService } from './cloudinary-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CloudinaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to uploadUrl with correct FormData', () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    service.uploadImage(file).subscribe();

    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('upload'));
    expect(req.request.body.get('file')).toBe(file);
    expect(req.request.body.get('folder')).toBe('avatars');
    req.flush({});
  });
});
