import { TestBed } from '@angular/core/testing';

import { KeyStorageService } from './key-storage-service';
import { DecryptoGameData } from '../../../components/games/decrypto/decrypto';

describe('KeyStorageService', () => {
  let service: KeyStorageService<DecryptoGameData>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyStorageService<DecryptoGameData>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
