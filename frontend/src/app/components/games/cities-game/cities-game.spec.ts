import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';
import { UserService } from '../../../core/services/user/user-service';
import { User } from '../../../core/services/user/models/user.interfaces';
import { of } from 'rxjs';

import { CitiesGame } from './cities-game';
const mockUserService = {
  getUser: (): { subscribe: (cb: (user: User) => void) => void } => ({
    subscribe: (cb: (user: User) => void): void =>
      cb({
        username: 'user',
        email: 'user@test.com',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: '2026-03-14T00:00:00Z',
        provider: 'local',
        providerId: null,
      }),
  }),
};
const mockKeyStorageService = {
  getData: vi.fn().mockReturnValue(
    of({
      storage: {
        words: [],
      },
    }),
  ),
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
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CitiesGame);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
