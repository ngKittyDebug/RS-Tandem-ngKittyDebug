import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeGame } from './merge-game';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('MergeGame', () => {
  let component: MergeGame;
  let fixture: ComponentFixture<MergeGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MergeGame,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MergeGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
