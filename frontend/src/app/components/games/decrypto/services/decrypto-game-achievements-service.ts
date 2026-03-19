import { inject, Injectable } from '@angular/core';
import { AchievementList, DecryptoAchievement } from './models/decrypto-achievement.interfaces';
import { AchievementsConditions, BaseAchievements, CONFIG } from './models/decrypto.constants';
import { AppTosterService } from '../../../../core/services/app-toster-service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class DecryptoGameAchievementsService {
  protected readonly toasterService = inject(AppTosterService);
  protected readonly translocoService = inject(TranslocoService);

  public currentGameAchievements: AchievementList = BaseAchievements;
  public lastGameAchievement: DecryptoAchievement | undefined;

  public checkAchievements(time: number, mistakes: number): void {
    const currentGameTime = CONFIG.gameTime - time;
    const currentGameMistakes = CONFIG.attempts - mistakes;
    const achievementId = Object.keys(AchievementsConditions).find((id) => {
      const condition = AchievementsConditions[+id];
      return currentGameTime <= condition.time && currentGameMistakes === condition.mistakes;
    });

    if (achievementId) {
      this.updateAchievement(+achievementId);
    }
  }

  private updateAchievement(id: number): void {
    const achievement = this.currentGameAchievements[id];
    const condition = AchievementsConditions[id];
    const lang = this.translocoService.getActiveLang();

    achievement.count += 1;

    if (!achievement.status) {
      achievement.status = true;
      const message = `${this.translocoService.translate('decrypto.decryptoAchievementMessage1')}${condition.time}${this.translocoService.translate('decrypto.decryptoAchievementMessage2')}`;

      this.toasterService.showAchievementToster(
        message,
        achievement.name[lang],
        condition.iconName,
      );
    }
  }
}
