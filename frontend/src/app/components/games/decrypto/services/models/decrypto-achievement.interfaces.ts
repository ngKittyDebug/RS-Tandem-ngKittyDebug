export interface DecryptoAchievement {
  name: DecryptoAchievementName;
  status: boolean;
  count: number;
}

interface DecryptoAchievementName {
  en: string;
  ru: string;
  [key: string]: string;
}

export interface AchievementCondition {
  iconName: string;
  time: number;
  mistakes: number;
}

export type AchievementList = Record<number, DecryptoAchievement>;

export type AchievementConditionList = Record<number, AchievementCondition>;
