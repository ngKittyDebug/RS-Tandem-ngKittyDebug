import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settings } from './settings';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Settings,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
