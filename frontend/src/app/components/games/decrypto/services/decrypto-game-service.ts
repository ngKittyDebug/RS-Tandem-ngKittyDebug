import { Injectable, signal } from '@angular/core';
import { DECRYPTO_CODES, GameCards, StartGameCards } from '../models/decrypto-cards.constants';
import { Card } from '../models/decrypto-card.interface';
import { generateNumber } from '../helpers/generate-number.helper';
import { shuffleArray } from '../helpers/shuffle-array.helper';

const DEFAULT_CARDS_COUNT = 4;
const DEFAULT_GAME_ROUNDS = 3;
const START_CARDS_COUNT = 0;
const START_GAME_ROUND = 1;
const GAME_ATTEMPTS = 3;

@Injectable({
  providedIn: 'root',
})
export class DecryptoGameService {
  public gameCards: Card[] = StartGameCards;
  public gameCardsForGame: Card[] = StartGameCards;
  public gameWrightCode: number[] = [];
  public gameWrightCodes: number[][] = [];
  public gameHints: string[][] = [];
  public gamePeriod = signal<number>(START_GAME_ROUND);
  public gameAttempts = signal<number>(GAME_ATTEMPTS);
  public gameResult = signal<boolean | null>(null);
  public roundResult = signal<boolean | null>(null);

  public generateWrightCode(): void {
    this.gameWrightCode = this.gameWrightCodes[this.gamePeriod() - 1];
  }

  public generateWrightCodesForGame(): void {
    this.gameWrightCodes = [];
    const wrightCodesIdsArr: number[] = [];
    const wrightCodesArr: number[][] = [];

    while (wrightCodesArr.length < DEFAULT_GAME_ROUNDS) {
      const wrightCodeNumber = generateNumber(Object.values(DECRYPTO_CODES).length);
      if (!wrightCodesIdsArr.includes(wrightCodeNumber)) {
        wrightCodesIdsArr.push(wrightCodeNumber);
        wrightCodesArr.push(DECRYPTO_CODES[wrightCodeNumber]);
      }
    }
    this.gameWrightCodes = JSON.parse(JSON.stringify(wrightCodesArr));
    console.log(this.gameWrightCodes);
  }

  public generateCards(): void {
    this.gameCards = this.gameCardsForGame.splice(0, 4);
    // const cardsIdsArr: number[] = [];
    // const cardsArr: Card[] = [];
    // while (cardsIdsArr.length < DEFAULT_CARDS_COUNT) {
    //   const cardNumber = generateNumber(Object.values(GameCards).length - 1, START_CARDS_COUNT);
    //   if (!cardsIdsArr.includes(cardNumber)) {
    //     cardsIdsArr.push(cardNumber);
    //     cardsArr.push(GameCards[cardNumber]);
    //   }
    // }
    // this.gameCards = JSON.parse(JSON.stringify(cardsArr));
  }

  public generateCardsForGame(): void {
    this.gameCardsForGame = [];
    const cardsIdsArr: number[] = [];
    const cardsArr: Card[] = [];
    while (cardsIdsArr.length < DEFAULT_CARDS_COUNT * DEFAULT_GAME_ROUNDS) {
      const cardNumber = generateNumber(Object.values(GameCards).length - 1, START_CARDS_COUNT);
      if (!cardsIdsArr.includes(cardNumber)) {
        cardsIdsArr.push(cardNumber);
        cardsArr.push(GameCards[cardNumber]);
      }
    }
    this.gameCardsForGame = JSON.parse(JSON.stringify(cardsArr));
    console.log(cardsArr);
    console.log(this.gameCardsForGame);
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
    if (gamePeriodResult && this.gamePeriod() === 3) {
      this.gameResult.set(true);
      console.log('you win game');
    } else if (gamePeriodResult) {
      // this.gamePeriod.update((current) => current + 1);
      this.roundResult.set(true);
      console.log('you win period');
    } else if (this.gameAttempts() > 1) {
      // this.gamePeriod.update((current) => current + 1);
      this.gameAttempts.update((current) => current - 1);
      this.roundResult.set(false);
      console.log('you lose period');
    } else if (this.gameAttempts() === 1 && !gamePeriodResult) {
      this.gameAttempts.update((current) => current - 1);
      this.gameResult.set(false);
      console.log('you lose game');
    }
  }
}
