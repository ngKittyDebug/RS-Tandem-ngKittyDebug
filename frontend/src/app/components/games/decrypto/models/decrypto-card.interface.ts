export interface Card {
  id: string;
  cardName: string;
  cardHints: string[];
  cardDescriptionEn: string;
  cardDescriptionRu: string;
}

export type DecryptoCodes = Record<number, number[]>;
