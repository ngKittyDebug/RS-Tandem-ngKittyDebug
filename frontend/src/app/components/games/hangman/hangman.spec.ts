import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hangman } from './hangman';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('Hangman', () => {
  let component: Hangman;
  let fixture: ComponentFixture<Hangman>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Hangman,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Hangman);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
