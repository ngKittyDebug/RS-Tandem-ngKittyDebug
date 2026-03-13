import { Injectable, signal } from '@angular/core';
import { DECRYPTO_CODES, GameCards, StartGameCards } from '../models/decrypto-cards.constants';
import { Card } from '../models/decrypto-card.interface';
import { generateNumber } from '../helpers/generate-number.helper';
import { shuffleArray } from '../helpers/shuffle-array.helper';

const DEFAULT_CARDS_COUNT = 4;
const START_CARDS_COUNT = 0;
const START_GAME_ROUND = 1;

@Injectable({
  providedIn: 'root',
})
export class DecryptoGameService {
  public gameCards: Card[] = StartGameCards;
  public gameWrightCode: number[] = [];
  public gameHints: string[][] = [];
  public gamePeriod = signal<number>(START_GAME_ROUND);
  public gameResult = signal<boolean | null>(null);

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
    this.gameCards = JSON.parse(JSON.stringify(cardsArr));
  }

  public generateGameHints(): void {
    const hintsArr: string[][] = [];
    this.gameWrightCode.forEach((item) => {
      const hints: string[] = this.gameCards[item - 1].cardHints;
      hintsArr.push(hints);
    });
    this.gameHints = JSON.parse(JSON.stringify(hintsArr));
    this.gameHints.forEach((hint) => shuffleArray(hint));
    console.log(this.gameWrightCode);
    console.log(this.gameCards);
  }

  public resetGameCards(): void {
    this.gameCards = StartGameCards;
  }

  public resetGameHints(): void {
    this.gameHints = [];
  }

  public checkResult(resultArr: (number | null)[]): void {
    const gamePeriodResult = JSON.stringify(resultArr) === JSON.stringify(this.gameWrightCode);
    console.log(gamePeriodResult);
    if (gamePeriodResult) {
      this.gameResult.set(true);
      console.log('you win game');
    } else if (this.gamePeriod() < 3) {
      this.gamePeriod.update((current) => current + 1);
      console.log('you lose period');
      console.log(gamePeriodResult);
    } else if (this.gamePeriod() >= 3 && !gamePeriodResult) {
      this.gameResult.set(false);
      console.log('you lose game');
    }
  }
}
