import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL, STORAGE_ENDPOINT } from '../../constants/api.constants';
import { catchError, Observable, throwError } from 'rxjs';
import { KeyStorageResponse } from './models/key-storage.interfaces';
import { AppTosterService } from '../app-toster-service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class KeyStorageService<T> {
  private http = inject(HttpClient);
  private tosterService = inject(AppTosterService);
  private readonly transloco = inject(TranslocoService);

  private getUrl(path = ''): string {
    return `${API_BASE_URL}${STORAGE_ENDPOINT}${path}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = this.transloco.translate('serverResponse.defaultError');
    if (error.status === 404) {
      message = this.transloco.translate('serverResponse.keyStorage.notFound');
    }
    this.tosterService.showErrorToster(message);
    return throwError(() => error);
  }

  public sentData(data: KeyStorageResponse<T>): Observable<KeyStorageResponse<T>> {
    return this.http
      .post<KeyStorageResponse<T>>(this.getUrl(), data)
      .pipe(catchError((err) => this.handleError(err)));
  }

  public getData(
    params: Omit<KeyStorageResponse<T>, 'storage'>,
  ): Observable<KeyStorageResponse<T>> {
    const url = this.getUrl('/params');
    return this.http
      .get<KeyStorageResponse<T>>(url, {
        params,
      })
      .pipe(catchError((err) => this.handleError(err)));
  }

  public getAllData(): Observable<KeyStorageResponse<T>> {
    const url = this.getUrl('/all');
    return this.http
      .get<KeyStorageResponse<T>>(url)
      .pipe(catchError((err) => this.handleError(err)));
  }

  public removeData(
    params: Omit<KeyStorageResponse<T>, 'storage'>,
  ): Observable<KeyStorageResponse<T>> {
    return this.http
      .delete<KeyStorageResponse<T>>(this.getUrl(), {
        params,
      })
      .pipe(catchError((err) => this.handleError(err)));
  }
}
