import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecryptoGameAchievementsService } from './decrypto-game-achievements-service';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { DecryptoGameService } from './decrypto-game-service';

describe.skip('DecryptoGameService', () => {
  let service: DecryptoGameService;
  const mockAchievementsService: Partial<DecryptoGameAchievementsService> = {
    checkAchievements: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
      providers: [
        DecryptoGameService,
        {
          provide: DecryptoGameAchievementsService,
          useValue: mockAchievementsService,
        },
      ],
    });

    service = TestBed.inject(DecryptoGameService);
  });

  it('should correctly generate gameWrightCode based on gamePeriod', () => {
    service.gameWrightCodes = [
      [1, 2, 3],
      [4, 2, 1],
    ];

    service.gamePeriod.set(2);
    service.generateWrightCode();

    expect(service.gameWrightCode).toEqual([4, 2, 1]);
  });

  it('should count the victory and trigger an achievement check in the 3rd period', () => {
    service.gameWrightCode = [1, 2, 3];
    service.gamePeriod.set(3);
    service.gameAttempts.set(3);
    const gameTime = 120;

    service.checkResult([1, 2, 3], gameTime);

    expect(service.gameResult()).toBe(true);
    expect(mockAchievementsService.checkAchievements).toHaveBeenCalledWith(gameTime, 3);
  });

  it('should reduce the number of attempts when the code is incorrect', () => {
    service.gameWrightCode = [1, 2, 3];
    service.gameAttempts.set(2);

    service.checkResult([1, 1, 1], undefined);

    expect(service.gameAttempts()).toBe(1);
    expect(service.roundResult()).toBe(false);
    expect(service.gameResult()).toBeNull();
  });

  it('should end the game by losing if this is last attempt', () => {
    service.gameWrightCode = [1, 2, 3];
    service.gameAttempts.set(1);

    service.checkResult([4, 4, 4], undefined);

    expect(service.gameAttempts()).toBe(0);
    expect(service.gameResult()).toBe(false);
  });

  it('should clear the hints when calling resetGameHints', () => {
    service.gameHints = [['test']];
    service.resetGameHints();
    expect(service.gameHints).toEqual([]);
  });
});
