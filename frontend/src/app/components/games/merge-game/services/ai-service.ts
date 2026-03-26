import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../../../core/constants/api.constants';
import { CheckAnswerAi, ResponseCheckAnswerAi } from '../models/ai-methods.interface';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);

  public checkAnswerAi(data: CheckAnswerAi): Observable<ResponseCheckAnswerAi> {
    return this.http
      .post<ResponseCheckAnswerAi>(`${API_BASE_URL}/ai/check-answer`, data, {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        }),
      );
  }
}
