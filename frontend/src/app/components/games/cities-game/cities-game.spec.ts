import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { CitiesGame } from './cities-game';

describe('CitiesGame', () => {
  let component: CitiesGame;
  let fixture: ComponentFixture<CitiesGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CitiesGame,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CitiesGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
