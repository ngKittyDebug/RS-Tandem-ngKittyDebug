import { Card, DecryptoCodes } from './decrypto-card.interface';

export const StartGameCards: Card[] = [
  {
    id: '1',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
  {
    id: '2',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
  {
    id: '3',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
  {
    id: '4',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
];

export const DECRYPTO_CODES: DecryptoCodes = {
  1: [1, 2, 3],
  2: [1, 2, 4],
  3: [1, 3, 2],
  4: [1, 3, 4],
  5: [1, 4, 2],
  6: [1, 4, 3],
  7: [2, 1, 3],
  8: [2, 1, 4],
  9: [2, 3, 1],
  10: [2, 3, 4],
  11: [2, 4, 1],
  12: [2, 4, 3],
  13: [3, 1, 2],
  14: [3, 1, 4],
  15: [3, 2, 1],
  16: [3, 2, 4],
  17: [3, 4, 1],
  18: [3, 4, 2],
  19: [4, 1, 2],
  20: [4, 1, 3],
  21: [4, 2, 1],
  22: [4, 2, 3],
  23: [4, 3, 1],
  24: [4, 3, 2],
};
