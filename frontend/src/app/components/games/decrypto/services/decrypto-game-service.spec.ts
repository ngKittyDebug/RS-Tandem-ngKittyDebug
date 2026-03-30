import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecryptoGameAchievementsService } from './decrypto-game-achievements-service';
import { AppTosterService } from '../../../../core/services/app-toster-service';
import { TranslocoService } from '@jsverse/transloco';
import { CONFIG } from './models/decrypto.constants';
import { Card } from '../models/decrypto-card.interface';
import { DecryptoGameService } from './decrypto-game-service';

describe('DecryptoGameService', () => {
  let service: DecryptoGameService;

  const achievementsServiceMock = {
    checkAchievements: vi.fn(),
  } as unknown as DecryptoGameAchievementsService;

  const toasterServiceMock = {} as AppTosterService;

  const translocoServiceMock = {
    translate: vi.fn(),
  } as unknown as TranslocoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DecryptoGameService,
        { provide: DecryptoGameAchievementsService, useValue: achievementsServiceMock },
        { provide: AppTosterService, useValue: toasterServiceMock },
        { provide: TranslocoService, useValue: translocoServiceMock },
      ],
    });

    service = TestBed.inject(DecryptoGameService);
    vi.restoreAllMocks();
  });

  describe('Generation Logic', () => {
    it('should initialize gameWrightCodes with correct length based on config', () => {
      service.generateWrightCodesForGame();
      expect(service.gameWrightCodes.length).toBe(CONFIG.defaultRounds);
      expect(service.gameWrightCodes).toBeInstanceOf(Array);
    });

    it('should correctly select the current round code based on gamePeriod', () => {
      const mockCodes = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      service.gameWrightCodes = [...mockCodes];
      service.gamePeriod.set(2);

      service.generateWrightCode();

      expect(service.gameWrightCode).toEqual([4, 5, 6]);
    });

    it('should fill gameCardsForGame using data from gameCardsFromServer', () => {
      const mockCard: Card = { id: '1', cardName: 'name', cardHints: ['test', 'test2', 'test3'] };
      service.gameCardsFromServer = Array(20).fill(mockCard);

      service.generateCardsForGame();

      const expectedLength = CONFIG.defaultCards * CONFIG.defaultRounds;
      expect(service.gameCardsForGame.length).toBe(expectedLength);
      expect(service.gameCardsForGame[0]).toEqual(mockCard);
    });
  });

  describe('Game Mechanics (checkResult)', () => {
    beforeEach(() => {
      service.gameWrightCode = [1, 2, 3];
      service.gamePeriod.set(1);
      service.gameAttempts.set(3);
      service.roundResult.set(null);
      service.gameResult.set(null);
    });

    it('should set roundResult to true when the code is correct', () => {
      service.checkResult([1, 2, 3], 100);

      expect(service.roundResult()).toBe(true);
      expect(service.gameResult()).toBe(null);
    });

    it('should decrease attempts when the code is incorrect', () => {
      service.checkResult([3, 2, 1], 100);

      expect(service.gameAttempts()).toBe(2);
      expect(service.roundResult()).toBe(false);
    });

    it('should end the game with a win on the final period (period 3)', () => {
      service.gamePeriod.set(3);
      service.checkResult([1, 2, 3], 500);

      expect(service.gameResult()).toBe(true);
      expect(achievementsServiceMock.checkAchievements).toHaveBeenCalledWith(500, 3);
    });

    it('should set gameResult to false when attempts reach zero', () => {
      service.gameAttempts.set(1);
      service.checkResult([9, 9, 9], 100);

      expect(service.gameResult()).toBe(false);
      expect(service.gameAttempts()).toBe(0);
    });
  });

  describe('State Reset', () => {
    it('should clear hints when calling resetGameHints', () => {
      service.gameHints = [['hint']];
      service.resetGameHints();
      expect(service.gameHints).toEqual([]);
    });

    it('should restore default cards when calling resetGameCards', () => {
      service.gameCards = [];
      service.resetGameCards();
      expect(service.gameCards.length).toBeGreaterThan(0);
    });
  });

  describe('Card and Hint Mapping', () => {
    beforeEach(() => {
      const mockCards: Card[] = [
        { id: '1', cardName: 'name', cardHints: ['hint1_A', 'hint1_B'] },
        { id: '2', cardName: 'name', cardHints: ['hint2_A', 'hint2_B'] },
        { id: '3', cardName: 'name', cardHints: ['hint3_A', 'hint3_B'] },
        { id: '4', cardName: 'name', cardHints: ['hint4_A', 'hint4_B'] },
      ];
      service.gameCardsForGame = [...mockCards];
      service.gameCards = [...mockCards];
    });

    it('should extract the correct subset of cards for the current period (generateCards)', () => {
      service.gamePeriod.set(1);
      service.generateCards();
      expect(service.gameCards.length).toBe(CONFIG.defaultCards);
      expect(service.gameCards[0].id).toBe('1');

      service.gamePeriod.set(2);
      service.gameCardsForGame = Array(8).fill({ id: 99, cardHints: [] });
      service.generateCards();
      expect(service.gameCards.length).toBe(CONFIG.defaultCards);
    });

    it('should generate hints based on gameWrightCode and gameCards (generateGameHints)', () => {
      service.gameWrightCode = [1, 3];
      service.gameCards = [
        { id: '1', cardName: 'name', cardHints: ['hint1'] },
        { id: '2', cardName: 'name', cardHints: ['hint2'] },
        { id: '3', cardName: 'name', cardHints: ['hint3'] },
      ];

      service.generateGameHints();
      expect(service.gameHints.length).toBe(2);
      expect(service.gameHints[0]).toContain('hint1');
      expect(service.gameHints[1]).toContain('hint3');
    });

    it('should create a deep copy of hints to prevent original data mutation', () => {
      service.gameWrightCode = [1];
      const originalHints = ['A', 'B', 'C'];
      service.gameCards = [{ id: '1', cardName: 'name', cardHints: originalHints }];

      service.generateGameHints();
      service.gameHints[0][0] = 'MUTATED';
      expect(service.gameCards[0].cardHints[0]).not.toBe('MUTATED');
    });
  });
});
