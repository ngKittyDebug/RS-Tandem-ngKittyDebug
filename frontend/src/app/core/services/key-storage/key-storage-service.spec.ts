import { TestBed } from '@angular/core/testing';

import { KeyStorageService } from './key-storage-service';
import { DecryptoGameData } from '../../../components/games/decrypto/decrypto';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('KeyStorageService', () => {
  let service: KeyStorageService<DecryptoGameData>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
    });
    service = TestBed.inject(KeyStorageService<DecryptoGameData>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
