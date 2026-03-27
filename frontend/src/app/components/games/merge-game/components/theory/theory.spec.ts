import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Theory } from './theory';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { ResponseData } from '../../models/data.interface';
import { GameService } from '../../services/game-service';

describe('Theory', () => {
  let component: Theory;
  let fixture: ComponentFixture<Theory>;

  const mockGameService = {
    getAllCards: (): Observable<ResponseData> =>
      of({
        data: [],
        pagination: { page: 0, limit: 0, total: 0, totalPages: 0 },
      }),
  };

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
      providers: [provideNoopAnimations(), { provide: GameService, useValue: mockGameService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Theory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
