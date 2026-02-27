import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { LaguageSwitcher } from './laguage-switcher';

describe('LaguageSwitcher', () => {
  let component: LaguageSwitcher;
  let fixture: ComponentFixture<LaguageSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LaguageSwitcher,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LaguageSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
