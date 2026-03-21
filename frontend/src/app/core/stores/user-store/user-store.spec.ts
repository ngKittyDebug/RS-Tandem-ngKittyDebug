import { TestBed } from '@angular/core/testing';

import { UserStore } from './user-store';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('UserStore', () => {
  let service: UserStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    });
    service = TestBed.inject(UserStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
