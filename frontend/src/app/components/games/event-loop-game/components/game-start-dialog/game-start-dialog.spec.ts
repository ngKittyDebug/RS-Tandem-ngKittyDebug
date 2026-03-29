import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameStartDialog } from './game-start-dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('GameStartDialog', () => {
  let component: GameStartDialog;
  let fixture: ComponentFixture<GameStartDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GameStartDialog,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameStartDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
