import { TestBed } from '@angular/core/testing';
import { Decrypto } from './decrypto';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';
import { DecryptoGameService } from './services/decrypto-game-service';
import { AppTosterService } from '../../../core/services/app-toster-service';
import { PopupService } from '../../../core/services/popup/popup-service';
import { UserService } from '../../../core/services/user/user-service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from './services/models/decrypto.constants';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { HttpErrorResponse } from '@angular/common/http';

const mockCards = Array.from({ length: 12 }, (_, i) => ({
  id: `${i}`,
  cardName: `Card ${i}`,
  cardHints: [`hint${i}_0`, `hint${i}_1`, `hint${i}_2`],
}));

const mockServerData = {
  storage: { gameCards: mockCards },
};

const keyStorageMock = {
  getData: vi.fn(() => of(mockServerData)),
  sentData: vi.fn(() => of({})),
  removeData: vi.fn(() => of({})),
};

const tosterMock = {
  showErrorToster: vi.fn(),
  showWarningToster: vi.fn(),
  showPositiveToster: vi.fn(),
};

const popupMock = {
  openPopup: vi.fn(() => of(undefined)),
};

const userServiceMock = {
  statsUpdate: vi.fn(() => of({})),
};

const routerMock = {
  navigate: vi.fn(),
};

async function createComponent(): Promise<{
  fixture: ReturnType<typeof TestBed.createComponent<Decrypto>>;
  component: Decrypto;
  gameService: DecryptoGameService;
}> {
  await TestBed.configureTestingModule({
    imports: [
      Decrypto,
      TranslocoTestingModule.forRoot({
        langs: { en: {}, ru: {} },
        translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
      }),
    ],
    providers: [
      DecryptoGameService,
      { provide: KeyStorageService, useValue: keyStorageMock },
      { provide: AppTosterService, useValue: tosterMock },
      { provide: PopupService, useValue: popupMock },
      { provide: UserService, useValue: userServiceMock },
      { provide: Router, useValue: routerMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(Decrypto);
  const component = fixture.componentInstance;
  const gameService = TestBed.inject(DecryptoGameService);
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, component, gameService };
}

describe('Decrypto Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    keyStorageMock.getData.mockReturnValue(of(mockServerData));
    userServiceMock.statsUpdate.mockReturnValue(of({}));
  });

  describe('initialization', () => {
    it('should create the component', async () => {
      const { component } = await createComponent();
      expect(component).toBeTruthy();
    });

    it('should load game cards from server on init', async () => {
      const { component, gameService } = await createComponent();
      expect(keyStorageMock.getData).toHaveBeenCalled();
      expect(gameService.gameCardsFromServer).toEqual(mockCards);
      expect(component['isLoaded']()).toBe(true);
    });

    it('should not load if server returns empty cards', async () => {
      keyStorageMock.getData.mockReturnValue(of({ storage: { gameCards: [] } }));
      const { component } = await createComponent();
      expect(component['isLoaded']()).toBe(false);
    });

    it('should have gameStarted as false initially', async () => {
      const { component } = await createComponent();
      expect(component['gameStarted']()).toBe(false);
    });

    it('should have code inputs disabled initially', async () => {
      const { component } = await createComponent();
      expect(component.decryptoForm.controls['code1'].disabled).toBe(true);
      expect(component.decryptoForm.controls['code2'].disabled).toBe(true);
      expect(component.decryptoForm.controls['code3'].disabled).toBe(true);
    });
  });

  describe('newGame', () => {
    it('should reset game state', async () => {
      const { component, gameService } = await createComponent();
      const resetCardsSpy = vi.spyOn(gameService, 'resetGameCards');
      const resetHintsSpy = vi.spyOn(gameService, 'resetGameHints');

      component['newGame']();

      expect(resetCardsSpy).toHaveBeenCalled();
      expect(resetHintsSpy).toHaveBeenCalled();
      expect(component['gameStarted']()).toBe(false);
      expect(gameService.gamePeriod()).toBe(CONFIG.startRound);
      expect(gameService.gameAttempts()).toBe(CONFIG.attempts);
      expect(gameService.gameResult()).toBeNull();
    });

    it('should reset the form', async () => {
      const { component } = await createComponent();
      component.decryptoForm.controls['hint1'].setValue('some hint');
      component['newGame']();
      expect(component.decryptoForm.controls['hint1'].value).toBe('');
    });

    it('should disable code inputs', async () => {
      const { component } = await createComponent();
      component['enableGameCodeInputs']();
      component['newGame']();
      expect(component.decryptoForm.controls['code1'].disabled).toBe(true);
    });
  });

  describe('startGame', () => {
    it('should set gameStarted to true', async () => {
      const { component } = await createComponent();
      component['startGame']();
      expect(component['gameStarted']()).toBe(true);
    });

    it('should enable code inputs', async () => {
      const { component } = await createComponent();
      component['startGame']();
      expect(component.decryptoForm.controls['code1'].enabled).toBe(true);
    });

    it('should call generateCardsForGame and generateCards', async () => {
      const { component, gameService } = await createComponent();
      const genCardsSpy = vi.spyOn(gameService, 'generateCardsForGame');
      const genGameCardsSpy = vi.spyOn(gameService, 'generateCards');

      component['startGame']();

      expect(genCardsSpy).toHaveBeenCalled();
      expect(genGameCardsSpy).toHaveBeenCalled();
    });

    it('should call statsUpdate', async () => {
      const { component } = await createComponent();
      component['startGame']();
      expect(userServiceMock.statsUpdate).toHaveBeenCalled();
    });

    it('should show error toster when statsUpdate returns 404', async () => {
      userServiceMock.statsUpdate.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 })),
      );
      const { component } = await createComponent();
      component['startGame']();
      expect(tosterMock.showErrorToster).toHaveBeenCalled();
    });

    it('should show error toster when statsUpdate returns 401', async () => {
      userServiceMock.statsUpdate.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 401 })),
      );
      const { component } = await createComponent();
      component['startGame']();
      expect(tosterMock.showErrorToster).toHaveBeenCalled();
    });
  });

  describe('toggleCodeInputs', () => {
    it('should enable all code inputs when called with true', async () => {
      const { component } = await createComponent();
      component['toggleCodeInputs'](true);
      expect(component.decryptoForm.controls['code1'].enabled).toBe(true);
      expect(component.decryptoForm.controls['code2'].enabled).toBe(true);
      expect(component.decryptoForm.controls['code3'].enabled).toBe(true);
    });

    it('should disable all code inputs when called with false', async () => {
      const { component } = await createComponent();
      component['toggleCodeInputs'](true);
      component['toggleCodeInputs'](false);
      expect(component.decryptoForm.controls['code1'].disabled).toBe(true);
      expect(component.decryptoForm.controls['code2'].disabled).toBe(true);
      expect(component.decryptoForm.controls['code3'].disabled).toBe(true);
    });
  });

  describe('submitDecryptoForm', () => {
    it('should show positive toster on round win', async () => {
      const { component, gameService } = await createComponent();
      vi.spyOn(gameService, 'checkResult').mockImplementation(() => {
        gameService.roundResult.set(true);
      });

      component['submitDecryptoForm']();
      expect(tosterMock.showPositiveToster).toHaveBeenCalled();
    });

    it('should show error toster when game is lost', async () => {
      const { component, gameService } = await createComponent();
      vi.spyOn(gameService, 'checkResult').mockImplementation(() => {
        gameService.gameResult.set(false);
      });

      component['submitDecryptoForm']();
      expect(tosterMock.showErrorToster).toHaveBeenCalled();
    });

    it('should show positive toster when game is won', async () => {
      const { component, gameService } = await createComponent();
      vi.spyOn(gameService, 'checkResult').mockImplementation(() => {
        gameService.gameResult.set(true);
      });

      component['submitDecryptoForm']();
      expect(tosterMock.showPositiveToster).toHaveBeenCalled();
    });

    it('should disable code inputs after submit', async () => {
      const { component, gameService } = await createComponent();
      vi.spyOn(gameService, 'checkResult').mockImplementation(() => {
        return;
      });
      component['enableGameCodeInputs']();
      component['submitDecryptoForm']();
      expect(component.decryptoForm.controls['code1'].disabled).toBe(true);
    });
  });

  describe('checkFinishedTimer', () => {
    it('should show error toster', async () => {
      const { component } = await createComponent();
      component['checkFinishedTimer']();
      expect(tosterMock.showErrorToster).toHaveBeenCalled();
    });

    it('should set gameResult to false', async () => {
      const { component, gameService } = await createComponent();
      component['checkFinishedTimer']();
      expect(gameService.gameResult()).toBe(false);
    });

    it('should disable code inputs', async () => {
      const { component } = await createComponent();
      component['enableGameCodeInputs']();
      component['checkFinishedTimer']();
      expect(component.decryptoForm.controls['code1'].disabled).toBe(true);
    });
  });

  describe('openAllGames', () => {
    it('should navigate to main route', async () => {
      const { component } = await createComponent();
      component['openAllGames']();
      expect(routerMock.navigate).toHaveBeenCalled();
    });

    it('should reset game state', async () => {
      const { component, gameService } = await createComponent();
      gameService.gameResult.set(true);
      component['openAllGames']();
      expect(component['gameStarted']()).toBe(false);
      expect(gameService.gameResult()).toBeNull();
      expect(gameService.gamePeriod()).toBe(CONFIG.startRound);
    });
  });

  describe('openRules', () => {
    it('should call popupService.openPopup', async () => {
      const { component } = await createComponent();
      component['openRules']();
      expect(popupMock.openPopup).toHaveBeenCalled();
    });
  });

  describe('openCardDescription', () => {
    it('should open popup when cardDescription and cardName are provided', async () => {
      const { component } = await createComponent();
      const desc = { en: '<p>English</p>', ru: '<p>Russian</p>' };
      component['openCardDescription'](desc, 'Test Card');
      expect(popupMock.openPopup).toHaveBeenCalled();
    });

    it('should not open popup when cardDescription is undefined', async () => {
      const { component } = await createComponent();
      component['openCardDescription'](undefined, 'Test Card');
      expect(popupMock.openPopup).not.toHaveBeenCalled();
    });

    it('should not open popup when cardName is empty', async () => {
      const { component } = await createComponent();
      const desc = { en: '<p>English</p>', ru: '<p>Russian</p>' };
      component['openCardDescription'](desc, '');
      expect(popupMock.openPopup).not.toHaveBeenCalled();
    });
  });

  describe('updateGameHintsInputs', () => {
    it('should patch hint values from gameHints', async () => {
      const { component, gameService } = await createComponent();
      gameService.gamePeriod.set(1);
      gameService.gameHints = [
        ['hintA', 'hintB'],
        ['hintC', 'hintD'],
        ['hintE', 'hintF'],
      ];

      component['updateGameHintsInputs']();

      expect(component.decryptoForm.controls['hint1'].value).toBe('hintA');
      expect(component.decryptoForm.controls['hint2'].value).toBe('hintC');
      expect(component.decryptoForm.controls['hint3'].value).toBe('hintE');
    });
  });

  describe('form validation', () => {
    it('should be invalid when hint fields are empty', async () => {
      const { component } = await createComponent();
      component.decryptoForm.reset();
      expect(component.decryptoForm.controls['hint1'].invalid).toBe(true);
    });

    it('should be valid when all required fields are filled', async () => {
      const { component } = await createComponent();
      component['enableGameCodeInputs']();
      component.decryptoForm.patchValue({
        code1: 1,
        code2: 2,
        code3: 3,
        hint1: 'a',
        hint2: 'b',
        hint3: 'c',
      });
      expect(component.decryptoForm.valid).toBe(true);
    });
  });
});
