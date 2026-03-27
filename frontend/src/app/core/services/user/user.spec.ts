import { TestBed } from '@angular/core/testing';

import { UserService } from './user-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  enum UserPath {
    BASE = '/user',
    PROFILE = '/profile',
    PASSWORD = '/password',
    AVATAR = '/avatar',
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET request to fetch user', () => {
    const mockUser = {
      username: 'John',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    service.getUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${UserPath.BASE}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockUser);
  });

  it('should send PATCH request to update user', () => {
    const dto = {
      username: 'Jane',
      email: 'jane@example.com',
      password: 'password',
    };

    const updatedUser = {
      username: 'John',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    service.updateUser(dto).subscribe((user) => {
      expect(user).toEqual(updatedUser);
    });

    const req = httpMock.expectOne(`${UserPath.BASE}${UserPath.PROFILE}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(updatedUser);
  });

  it('should send PATCH request to change password', () => {
    const dto = {
      oldPassword: 'old-pass',
      newPassword: 'new-pass',
    };

    service.changePassword(dto).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${UserPath.BASE}${UserPath.PASSWORD}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(null);
  });

  it('should send PATCH request to update avatar', () => {
    const dto = {
      avatar: 'avatar',
    };

    service.updateAvatar(dto).subscribe((response) => {
      expect(response).toEqual(dto);
    });

    const req = httpMock.expectOne(`${UserPath.BASE}${UserPath.AVATAR}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);

    req.flush(dto);
  });
});
