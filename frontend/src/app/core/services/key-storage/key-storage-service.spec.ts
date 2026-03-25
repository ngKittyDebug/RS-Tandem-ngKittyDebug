import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { API_BASE_URL, STORAGE_ENDPOINT } from '../../constants/api.constants';
import { AppTosterService } from '../app-toster-service';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { KeyStorageResponse } from './models/key-storage.interfaces';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KeyStorageService } from './key-storage-service';

interface TestData {
  id: number;
  value: string;
}

describe('KeyStorageService', () => {
  let service: KeyStorageService<TestData>;
  let httpMock: HttpTestingController;

  const mockTosterService = {
    showErrorToster: vi.fn(),
  };

  const mockTranslocoService = {
    translate: vi.fn((key: string) => key),
  };

  const baseUrl = `${API_BASE_URL}${STORAGE_ENDPOINT}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
      providers: [
        KeyStorageService,
        { provide: AppTosterService, useValue: mockTosterService },
        { provide: TranslocoService, useValue: mockTranslocoService },
      ],
    });

    service = TestBed.inject(KeyStorageService<TestData>);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should send a valid POST request', () => {
    const mockData: KeyStorageResponse<TestData> = {
      storage: { id: 1, value: 'test' },
      key: '',
    };

    service.sentData(mockData).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockData);
  });

  it('should send a GET request with the parameters', () => {
    const params: Omit<KeyStorageResponse<TestData>, 'storage'> = {
      key: '',
    };
    const mockResponse: KeyStorageResponse<TestData> = {
      storage: { id: 2, value: 'found' },
      key: '',
    };

    service.getData(params).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/params`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should send a DELETE request', () => {
    const params: Omit<KeyStorageResponse<TestData>, 'storage'> = {
      key: '',
    };
    const mockResponse: KeyStorageResponse<TestData> = {
      storage: { id: 3, value: 'deleted' },
      key: '',
    };

    service.removeData(params).subscribe();

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should handle 404 error via Transloco', () => {
    service.getAllData().subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
        expect(mockTranslocoService.translate).toHaveBeenCalledWith(
          'serverResponse.keyStorage.notFound',
        );
        expect(mockTosterService.showErrorToster).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne(`${baseUrl}/all`);
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
