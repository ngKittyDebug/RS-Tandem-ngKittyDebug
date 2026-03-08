import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Theory } from './theory';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('Theory', () => {
  let component: Theory;
  let fixture: ComponentFixture<Theory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Theory,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Theory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
