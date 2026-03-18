import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL, STORAGE_ENDPOINT } from '../../constants/api.constants';
import { Observable } from 'rxjs';
import { GameCards } from '../../../components/games/decrypto/models/decrypto-cards.constants';
import { Card } from '../../../components/games/decrypto/models/decrypto-card.interface';
import { KeyStorageResponse } from './models/key-storage.interfaces';
import { DecryptoGameService } from '../../../components/games/decrypto/services/decrypto-game-service';

const dataS = {
  key: 'decrypto-data-1',
  storage: { gameCards: GameCards },
};

interface DecryptoGameData {
  gameCards: Card[];
}

@Injectable({
  providedIn: 'root',
})
export class KeyStorageService {
  private http = inject(HttpClient);
  protected gameService = inject(DecryptoGameService);

  private getUrl(path = ''): string {
    return `${API_BASE_URL}${STORAGE_ENDPOINT}${path}`;
  }

  public sentData(): Observable<KeyStorageResponse<DecryptoGameData>> {
    return this.http.post<KeyStorageResponse<DecryptoGameData>>(this.getUrl(), dataS);
  }

  public getData(): Observable<KeyStorageResponse<DecryptoGameData>> {
    const url = this.getUrl('/params');
    return this.http.get<KeyStorageResponse<DecryptoGameData>>(url, {
      params: { key: 'decrypto-data-1' },
    });
  }

  public getAllData(): Observable<KeyStorageResponse<DecryptoGameData>> {
    const url = this.getUrl('/all');
    return this.http.get<KeyStorageResponse<DecryptoGameData>>(url);
  }

  public removeData(): Observable<KeyStorageResponse<DecryptoGameData>> {
    return this.http.delete<KeyStorageResponse<DecryptoGameData>>(this.getUrl(), {
      params: { key: 'user_settings' },
    });
  }
}
