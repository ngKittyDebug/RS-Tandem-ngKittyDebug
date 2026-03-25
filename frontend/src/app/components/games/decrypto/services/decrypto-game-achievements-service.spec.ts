import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppTosterService } from '../../../../core/services/app-toster-service';
import { TranslocoService } from '@jsverse/transloco';
import { CONFIG, AchievementsConditions } from './models/decrypto.constants';
import { DecryptoGameAchievementsService } from './decrypto-game-achievements-service';

describe('DecryptoGameAchievementsService', () => {
  let service: DecryptoGameAchievementsService;
  const toasterServiceMock: Partial<AppTosterService> = {
    showAchievementToster: vi.fn(),
  };

  const translocoServiceMock: Partial<TranslocoService> = {
    getActiveLang: vi.fn().mockReturnValue('ru'),
    translate: vi.fn().mockImplementation((key: string) => key),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DecryptoGameAchievementsService,
        { provide: AppTosterService, useValue: toasterServiceMock },
        { provide: TranslocoService, useValue: translocoServiceMock },
      ],
    });

    service = TestBed.inject(DecryptoGameAchievementsService);

    Object.keys(service.currentGameAchievements).forEach((key) => {
      const id = Number(key);
      const achievement = service.currentGameAchievements[id];
      if (achievement) {
        achievement.count = 0;
        achievement.status = false;
      }
    });

    vi.clearAllMocks();
  });

  it('should correctly identify and update the achievement when the conditions are met', () => {
    const firstKey = Object.keys(AchievementsConditions)[0];
    const testId = Number(firstKey);
    const condition = AchievementsConditions[testId];
    const timeInput = CONFIG.gameTime - condition.time;
    const mistakesInput = CONFIG.attempts - condition.mistakes;

    service.checkAchievements(timeInput, mistakesInput);

    const achievement = service.currentGameAchievements[testId];

    expect(achievement.count).toBe(1);
    expect(achievement.status).toBe(true);
    expect(toasterServiceMock.showAchievementToster).toHaveBeenCalled();
  });

  it('should not show the toaster again if the status is already true', () => {
    const firstKey = Object.keys(AchievementsConditions)[0];
    const testId = Number(firstKey);
    const condition = AchievementsConditions[testId];

    const timeInput = CONFIG.gameTime - condition.time;
    const mistakesInput = CONFIG.attempts - condition.mistakes;

    service.checkAchievements(timeInput, mistakesInput);
    service.checkAchievements(timeInput, mistakesInput);

    expect(service.currentGameAchievements[testId].count).toBe(2);
    expect(toasterServiceMock.showAchievementToster).toHaveBeenCalledTimes(1);
  });

  it('should not count an achievement if the conditions are not met', () => {
    service.checkAchievements(CONFIG.gameTime + 1, CONFIG.attempts + 1);

    const achievements = Object.values(service.currentGameAchievements);
    const hasActive = achievements.some((a) => a.status || a.count > 0);

    expect(hasActive).toBe(false);
    expect(toasterServiceMock.showAchievementToster).not.toHaveBeenCalled();
  });
});
