import { HttpClient } from '@angular/common/http';
import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LoginDto, LoginResponse, RegisterDto } from './models/auth.interfaces';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL, AUTH_ENDPOINT } from '../../constants/api.constants';
import { AUTH_PATHS } from './models/auth-path.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private accessToken = signal<string | null>(null);

  public isLoggedIn = computed(() => this.accessToken() !== null);
  public isRefreshing = false;
  public refreshSubject = new BehaviorSubject<string | null>(null);

  private getUrl(path: string): string {
    return `${API_BASE_URL}${AUTH_ENDPOINT}${path}`;
  }

  public register(data: RegisterDto): Observable<void> {
    return this.http
      .post<LoginResponse>(this.getUrl(AUTH_PATHS.REGISTER), data, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => this.accessToken.set(res.accessToken)),
        map(() => void 0),
        catchError((err) => {
          this.accessToken.set(null);
          return throwError(() => err);
        }),
      );
  }

  public login(data: LoginDto): Observable<void> {
    return this.http
      .post<LoginResponse>(this.getUrl(AUTH_PATHS.LOGIN), data, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => this.accessToken.set(res.accessToken)),
        map(() => void 0),
        catchError((err) => {
          this.accessToken.set(null);
          return throwError(() => err);
        }),
      );
  }

  public refresh(): Observable<void> {
    return this.http
      .post<LoginResponse>(this.getUrl(AUTH_PATHS.REFRESH), null, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => this.accessToken.set(res.accessToken)),
        map(() => void 0),
        catchError((err) => {
          this.accessToken.set(null);
          return throwError(() => err);
        }),
      );
  }

  public logout(): Observable<void> {
    return this.http
      .post<void>(this.getUrl(AUTH_PATHS.LOGOUT), null, {
        withCredentials: true,
      })
      .pipe(
        tap(() => this.accessToken.set(null)),
        map(() => void 0),
      );
  }

  public loginWithGitHub(): void {
    this.document.defaultView!.location.href = this.getUrl(AUTH_PATHS.GITHUB);
  }

  public getAccessToken(): string | null {
    return this.accessToken();
  }
}
