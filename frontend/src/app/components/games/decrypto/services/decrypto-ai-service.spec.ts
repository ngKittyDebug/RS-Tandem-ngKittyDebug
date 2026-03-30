import { TestBed } from '@angular/core/testing';

import { DecryptoAiService } from './decrypto-ai-service';

describe('DecryptoAiService', () => {
  let service: DecryptoAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecryptoAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
