import { TestBed } from '@angular/core/testing';

import { DecryptoCardsLoadService } from './decrypto-cards-load-service';

describe('DecryptoCardsLoadService', () => {
  let service: DecryptoCardsLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecryptoCardsLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
