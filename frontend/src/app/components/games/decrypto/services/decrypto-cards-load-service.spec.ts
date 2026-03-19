import { TestBed } from '@angular/core/testing';

import { DecryptoCardsLoadService } from './decrypto-cards-load-service';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('DecryptoCardsLoadService', () => {
  let service: DecryptoCardsLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
    });
    service = TestBed.inject(DecryptoCardsLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
