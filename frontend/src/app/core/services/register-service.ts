import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginResponse, RegisterDto } from '../../pages/registration/models/register.interfaces';
import { Observable, map, tap } from 'rxjs';
import { API_BASE_URL, AUTH_ENDPOINT } from '../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private accessToken = signal<string | null>(null);

  public register(data: RegisterDto): Observable<void> {
    return this.http
      .post<LoginResponse>(`${API_BASE_URL}${AUTH_ENDPOINT}/register`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.accessToken.set(res.accessToken);
        }),
        map(() => void 0),
      );
  }
}
