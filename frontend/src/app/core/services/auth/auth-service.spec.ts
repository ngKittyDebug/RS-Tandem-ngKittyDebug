import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set access token when login succeeds', () => {
    service.login({ email: 'test@test.test', password: 'Password1' }).subscribe();
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('login'));
    req.flush({ accessToken: 'fake-token' });
    expect(service.getAccessToken()).toBe('fake-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should clear access token when login fails', () => {
    service.login({ email: 'test@test.test', password: 'Password1' }).subscribe({
      next: () => {
        /* empty */
      },
      error: (err) => {
        expect(err).toBeTruthy();
      },
    });
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('login'));
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(service.getAccessToken()).toBe(null);
  });

  it('should set access token when register succeeds', () => {
    service
      .register({ email: 'test@test.test', username: 'Test', password: 'Password1' })
      .subscribe();
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('register'));
    req.flush({ accessToken: 'fake-token' });
    expect(service.getAccessToken()).toBe('fake-token');
  });

  it('should clear access token when register fails', () => {
    service
      .register({ email: 'test@test.test', username: 'Test', password: 'Password1' })
      .subscribe({
        next: () => {
          /* empty */
        },
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('register'));
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(service.getAccessToken()).toBe(null);
  });

  it('should clear access token when logout succeeds', () => {
    service.login({ email: 'test@test.test', password: 'Password1' }).subscribe();
    const loginReq = httpMock.expectOne((req) => req.url.includes('login'));
    loginReq.flush({ accessToken: 'fake-token' });

    expect(service.getAccessToken()).toBe('fake-token');

    service.logout().subscribe();
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('logout'));
    req.flush({ logout: true });
    expect(service.getAccessToken()).toBe(null);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should set access token when refresh succeeds', () => {
    service.refresh().subscribe();
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('refresh'));
    req.flush({ accessToken: 'fake-token' });
    expect(service.getAccessToken()).toBe('fake-token');
  });

  it('should clear access token when refresh fails', () => {
    service.refresh().subscribe({
      next: () => {
        /* empty */
      },
      error: (err) => {
        expect(err).toBeTruthy();
      },
    });
    const req = httpMock.expectOne((req) => req.method === 'POST' && req.url.includes('refresh'));
    req.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(service.getAccessToken()).toBe(null);
  });
});
