import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { LoginDto, LoginResponse, RegisterDto } from './models/auth.interfaces';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly url = 'https://meow-vault-pr-44.onrender.com/auth';
  private accessToken = signal<string | null>(null);

  public isLoggedIn = computed(() => this.accessToken() !== null);

  public register(data: RegisterDto): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.url}/register`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.accessToken.set(res.accessToken);
        }),
        map(() => void 0),
      );
  }

  public login(data: LoginDto): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.accessToken.set(res.accessToken);
        }),
        map(() => void 0),
      );
  }

  public refresh(): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.url}/refresh`, null, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => this.accessToken.set(res.accessToken)),
        map(() => void 0),
      );
  }

  public logout(): Observable<void> {
    return this.http
      .post<void>(`${this.url}/logout`, null, {
        withCredentials: true,
      })
      .pipe(
        tap(() => this.accessToken.set(null)),
        map(() => void 0),
      );
  }

  public getAccessToken(): string | null {
    return this.accessToken();
  }
}
