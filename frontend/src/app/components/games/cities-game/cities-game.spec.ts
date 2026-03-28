import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';

import { CitiesGame } from './cities-game';
const mockKeyStorageService = {
  getData: vi.fn().mockReturnValue({
    subscribe: (cb: (value: { storage: { words: unknown[] } }) => void) =>
      cb({
        storage: {
          words: [],
        },
      }),
  }),
};
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
      providers: [
        {
          provide: KeyStorageService,
          useValue: mockKeyStorageService,
        },
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
