import { Injectable, signal, inject } from '@angular/core';
import { DECRYPTO_CODES, StartGameCards } from '../models/decrypto-cards.constants';
import { Card } from '../models/decrypto-card.interface';
import { generateNumber } from '../helpers/generate-number.helper';
import { shuffleArray } from '../helpers/shuffle-array.helper';
import { CONFIG } from './models/decrypto.constants';
import { DecryptoGameAchievementsService } from './decrypto-game-achievements-service';
import { AppTosterService } from '../../../../core/services/app-toster-service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class DecryptoGameService {
  protected readonly gameAchievements = inject(DecryptoGameAchievementsService);
  protected readonly toasterService = inject(AppTosterService);
  protected readonly translocoService = inject(TranslocoService);
  public gameCards: Card[] = StartGameCards;
  public gameCardsForGame: Card[] = StartGameCards;
  public gameCardsFromServer: Card[] = [];
  public gameWrightCode: number[] = [];
  public gameWrightCodes: number[][] = [];
  public gameHints: string[][] = [];
  public gamePeriod = signal<number>(CONFIG.startRound);
  public gameAttempts = signal<number>(CONFIG.attempts);
  public gameResult = signal<boolean | null>(null);
  public roundResult = signal<boolean | null>(null);

  public generateWrightCode(): void {
    this.gameWrightCode = this.gameWrightCodes[this.gamePeriod() - 1];
  }

  public generateWrightCodesForGame(): void {
    this.gameWrightCodes = [];
    const wrightCodesIdsArr: number[] = [];
    const wrightCodesArr: number[][] = [];

    while (wrightCodesArr.length < CONFIG.defaultRounds) {
      const wrightCodeNumber = generateNumber(Object.values(DECRYPTO_CODES).length);
      if (!wrightCodesIdsArr.includes(wrightCodeNumber)) {
        wrightCodesIdsArr.push(wrightCodeNumber);
        wrightCodesArr.push(DECRYPTO_CODES[wrightCodeNumber]);
      }
    }
    this.gameWrightCodes = JSON.parse(JSON.stringify(wrightCodesArr));
  }

  public generateCards(): void {
    this.gameCards = this.gameCardsForGame.slice(
      0 + (CONFIG.defaultCards * this.gamePeriod() - CONFIG.defaultCards),
      4 + (CONFIG.defaultCards * this.gamePeriod() - CONFIG.defaultCards),
    );
  }

  public generateCardsForGame(): void {
    this.gameCardsForGame = [];
    const cardsIdsArr: number[] = [];
    const cardsArr: Card[] = [];
    while (cardsIdsArr.length < CONFIG.defaultCards * CONFIG.defaultRounds) {
      const cardNumber = generateNumber(
        Object.values(this.gameCardsFromServer).length - 1,
        CONFIG.startCards,
      );
      if (!cardsIdsArr.includes(cardNumber)) {
        cardsIdsArr.push(cardNumber);
        cardsArr.push(this.gameCardsFromServer[cardNumber]);
      }
    }
    this.gameCardsForGame = JSON.parse(JSON.stringify(cardsArr));
  }

  public generateGameHints(): void {
    const hintsArr: string[][] = [];
    this.gameWrightCode.forEach((item) => {
      const hints: string[] = this.gameCards[item - 1].cardHints;
      hintsArr.push(hints);
    });
    this.gameHints = JSON.parse(JSON.stringify(hintsArr));
    this.gameHints.forEach((hint) => shuffleArray(hint));
  }

  public resetGameCards(): void {
    this.gameCards = StartGameCards;
  }

  public resetGameHints(): void {
    this.gameHints = [];
  }

  public checkResult(resultArr: (number | null)[], gameTime: number | undefined): void {
    const gamePeriodResult = JSON.stringify(resultArr) === JSON.stringify(this.gameWrightCode);
    if (gamePeriodResult && this.gamePeriod() === 3) {
      this.gameResult.set(true);
      if (gameTime) this.gameAchievements.checkAchievements(gameTime, this.gameAttempts());
    } else if (gamePeriodResult) {
      this.roundResult.set(true);
    } else if (this.gameAttempts() > 1) {
      this.gameAttempts.update((current) => current - 1);
      this.roundResult.set(false);
    } else if (this.gameAttempts() === 1 && !gamePeriodResult) {
      this.gameAttempts.update((current) => current - 1);
      this.gameResult.set(false);
    }
  }
}
