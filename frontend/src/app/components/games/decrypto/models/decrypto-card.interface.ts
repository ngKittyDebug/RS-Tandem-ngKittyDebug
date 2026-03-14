export interface Card {
  id: string;
  cardName: string;
  cardHints: string[];
  cardDescriptionEn?: string;
  cardDescriptionRu?: string;
  cardDescription?: CardDescription;
}

export interface CardDescription {
  en: string;
  ru: string;
  [key: string]: string;
}

export type DecryptoCodes = Record<number, number[]>;
