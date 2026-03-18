import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL, STORAGE_ENDPOINT } from '../../../../core/constants/api.constants';
import { GameCards } from '../models/decrypto-cards.constants';
import { DecryptoGameService } from './decrypto-game-service';

const dataS = {
  key: 'decrypto-data-1',
  storage: {
    gameCards: GameCards,
  },
};

@Injectable({
  providedIn: 'root',
})
export class DecryptoCardsLoadService {
  private http = inject(HttpClient);
  protected gameService = inject(DecryptoGameService);

  private getUrl(path = ''): string {
    return `${API_BASE_URL}${STORAGE_ENDPOINT}${path}`;
  }

  public async sentGameData(): Promise<void> {
    const response = await fetch('https://meow-vault-pr-136.onrender.com/key-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataS),
    });

    const data = await response.json();
    console.log(data);
  }

  public async getGameData(): Promise<void> {
    const response = await fetch(
      'https://meow-vault-pr-136.onrender.com/key-storage/params?key=decrypto-data-1',
      {
        method: 'GET',
      },
    );
    const data = await response.json();
    this.gameService.gameCardsFromServer = data.storage.gameCards;
    console.log(this.gameService.gameCardsFromServer);
  }

  public async getGameDataAll(): Promise<void> {
    const response = await fetch('https://meow-vault-pr-136.onrender.com/key-storage/all', {
      method: 'GET',
    });
    const data = await response.json();
    console.log(data);
  }
}

/* 

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL, STORAGE_ENDPOINT } from '../../../../core/constants/api.constants';
import { GameCards } from '../models/decrypto-cards.constants';
import { DecryptoGameService } from './decrypto-game-service';

const dataS = {
  key: 'decrypto-data-1',
  storage: {
    gameCards: GameCards,
  },
};

@Injectable({
  providedIn: 'root',
})
export class DecryptoCardsLoadService {
  private http = inject(HttpClient);
  protected gameService = inject(DecryptoGameService);

  private getUrl(path = ''): string {
    return `${API_BASE_URL}${STORAGE_ENDPOINT}${path}`;
  }

  public async sentGameData(): Promise<void> {
    const response = await fetch('https://meow-vault-pr-136.onrender.com/key-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataS),
    });

    const data = await response.json();
    console.log(data);
  }

  public async getGameData(): Promise<void> {
    const response = await fetch(
      'https://meow-vault-pr-136.onrender.com/key-storage/params?key=decrypto-data-1',
      {
        method: 'GET',
      },
    );
    const data = await response.json();
    this.gameService.gameCardsFromServer = data.storage.gameCards;
    console.log(this.gameService.gameCardsFromServer);
  }
}

*/
