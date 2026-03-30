import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Decrypto } from './decrypto';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';
import { DecryptoGameService } from './services/decrypto-game-service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from './services/models/decrypto.constants';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('Decrypto Component - newGame', () => {
  let component: Decrypto;
  let fixture: ComponentFixture<Decrypto>;
  let gameService: DecryptoGameService;

  const mockServerData = {
    storage: {
      gameCards: ['Card 1', 'Card 2', 'Card 3'],
    },
  };

  const keyStorageMock = {
    getData: vi.fn(() => of(mockServerData)),
    sentData: vi.fn(() => of({})),
    removeData: vi.fn(() => of({})),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        Decrypto,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
      providers: [DecryptoGameService, { provide: KeyStorageService, useValue: keyStorageMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Decrypto);
    component = fixture.componentInstance;
    gameService = TestBed.inject(DecryptoGameService);

    fixture.detectChanges();
  });

  it('I need to reset the game state and load new data from the server', async () => {
    const resetCardsSpy = vi.spyOn(gameService, 'resetGameCards');
    const resetHintsSpy = vi.spyOn(gameService, 'resetGameHints');
    component['newGame']();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(resetCardsSpy).toHaveBeenCalled();
    expect(resetHintsSpy).toHaveBeenCalled();
    expect(keyStorageMock.getData).toHaveBeenCalled();
    expect(component['gameStarted']()).toBe(false);
    expect(gameService.gamePeriod()).toBe(CONFIG.startRound);
    expect(gameService.gameCardsFromServer).toEqual(mockServerData.storage.gameCards);
    expect(component.decryptoForm.pristine).toBe(true);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(Decrypto);
    const decrypto = fixture.componentInstance;
    expect(decrypto).toBeTruthy();
  });
});
