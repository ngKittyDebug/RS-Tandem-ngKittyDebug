import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Decrypto } from './decrypto';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('Decrypto', () => {
  let component: Decrypto;
  let fixture: ComponentFixture<Decrypto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Decrypto,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Decrypto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
