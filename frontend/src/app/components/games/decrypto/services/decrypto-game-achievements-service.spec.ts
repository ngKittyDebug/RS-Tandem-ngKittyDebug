import { TestBed } from '@angular/core/testing';

import { DecryptoGameAchievementsService } from './decrypto-game-achievements-service';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('DecryptoGameAchievementsService', () => {
  let service: DecryptoGameAchievementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
    });
    service = TestBed.inject(DecryptoGameAchievementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
