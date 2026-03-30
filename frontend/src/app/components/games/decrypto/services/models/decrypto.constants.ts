import { AchievementConditionList, AchievementList } from './decrypto-achievement.interfaces';

export const CONFIG = {
  defaultCards: 4,
  defaultRounds: 3,
  startCards: 0,
  startRound: 1,
  attempts: 3,
  gameTime: 180,
};

export const BaseAchievements: AchievementList = {
  1: { name: { en: 'Tiger Lion', ru: 'Тигриный лев' }, status: false, count: 0 },
  2: { name: { en: 'Fluffy Legend', ru: 'Пушистая легенда' }, status: false, count: 0 },
  3: { name: { en: 'Tangle Storm', ru: 'Гроза клубков' }, status: false, count: 0 },
  4: { name: { en: 'Doorway Frequenter', ru: 'Завсегдатай подворотни' }, status: false, count: 0 },
  5: { name: { en: 'The errand cat', ru: 'Кот на побегушках' }, status: false, count: 0 },
};

export const AchievementsConditions: AchievementConditionList = {
  1: { iconName: '@tui.tally-5', time: 40, mistakes: 0 },
  2: { iconName: '@tui.tally-4', time: 60, mistakes: 0 },
  3: { iconName: '@tui.tally-3', time: 80, mistakes: 0 },
  4: { iconName: '@tui.tally-2', time: 100, mistakes: 0 },
  5: { iconName: '@tui.tally-1', time: 120, mistakes: 0 },
};
