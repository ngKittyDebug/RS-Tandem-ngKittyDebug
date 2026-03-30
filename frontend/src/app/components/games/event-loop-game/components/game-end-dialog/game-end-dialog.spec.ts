import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEndDialog } from './game-end-dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('GameEndDialog', () => {
  let component: GameEndDialog;
  let fixture: ComponentFixture<GameEndDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GameEndDialog,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameEndDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
