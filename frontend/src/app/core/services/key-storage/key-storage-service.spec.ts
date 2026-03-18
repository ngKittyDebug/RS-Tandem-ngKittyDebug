import { TestBed } from '@angular/core/testing';

import { KeyStorageService } from './key-storage-service';

describe('KeyStorageService', () => {
  let service: KeyStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
