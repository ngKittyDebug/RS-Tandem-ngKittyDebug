import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL, STORAGE_ENDPOINT } from '../../constants/api.constants';
import { Observable } from 'rxjs';
import { KeyStorageResponse } from './models/key-storage.interfaces';

@Injectable({
  providedIn: 'root',
})
export class KeyStorageService<T> {
  private http = inject(HttpClient);

  private getUrl(path = ''): string {
    return `${API_BASE_URL}${STORAGE_ENDPOINT}${path}`;
  }

  public sentData(data: KeyStorageResponse<T>): Observable<KeyStorageResponse<T>> {
    return this.http.post<KeyStorageResponse<T>>(this.getUrl(), data);
  }

  public getData(
    params: Omit<KeyStorageResponse<T>, 'storage'>,
  ): Observable<KeyStorageResponse<T>> {
    const url = this.getUrl('/params');
    return this.http.get<KeyStorageResponse<T>>(url, {
      params,
    });
  }

  public getAllData(): Observable<KeyStorageResponse<T>> {
    const url = this.getUrl('/all');
    return this.http.get<KeyStorageResponse<T>>(url);
  }

  public removeData(
    params: Omit<KeyStorageResponse<T>, 'storage'>,
  ): Observable<KeyStorageResponse<T>> {
    return this.http.delete<KeyStorageResponse<T>>(this.getUrl(), {
      params,
    });
  }
}
