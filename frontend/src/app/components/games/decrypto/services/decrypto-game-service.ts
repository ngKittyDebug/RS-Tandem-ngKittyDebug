import { Injectable } from '@angular/core';
import { DECRYPTO_CODES, GameCards, StartGameCards } from '../models/decrypto-cards.constants';
import { Card } from '../models/decrypto-card.interface';
import { generateNumber } from '../helpers/generate-number.helper';

const DEFAULT_CARDS_COUNT = 4;
const START_CARDS_COUNT = 0;

@Injectable({
  providedIn: 'root',
})
export class DecryptoGameService {
  public gameCards: Card[] = StartGameCards;
  public gameWrightCode: number[] = [];

  public generateWrightCode(): void {
    const wrightCodeNumber = generateNumber(Object.values(DECRYPTO_CODES).length);
    this.gameWrightCode = DECRYPTO_CODES[wrightCodeNumber];
  }

  public generateCards(): void {
    const cardsIdsArr: number[] = [];
    const cardsArr: Card[] = [];
    while (cardsIdsArr.length < DEFAULT_CARDS_COUNT) {
      const cardNumber = generateNumber(Object.values(GameCards).length - 1, START_CARDS_COUNT);
      if (!cardsIdsArr.includes(cardNumber)) {
        cardsIdsArr.push(cardNumber);
        cardsArr.push(GameCards[cardNumber]);
      }
    }
    this.gameCards = cardsArr;
  }

  public resetGameCards(): void {
    this.gameCards = StartGameCards;
  }
}
