import { TestBed } from '@angular/core/testing';

import { DecryptoGameService } from './decrypto-game-service';

describe('DecryptoGameService', () => {
  let service: DecryptoGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecryptoGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
