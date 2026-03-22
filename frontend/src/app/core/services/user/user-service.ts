import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangePasswordDto, UpdateUserDto, User } from './models/user.interfaces';
import { UserPath } from './models/user-path.enum';
import { getUrl } from './utils/utils';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = import.meta.env['NG_APP_API_URL'];

  public getUser(): Observable<User> {
    return this.http.get<User>(getUrl(this.baseUrl, UserPath.BASE));
  }

  public updateUser(data: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(getUrl(this.baseUrl, UserPath.BASE, UserPath.PROFILE), data);
  }

  public changePassword(data: ChangePasswordDto): Observable<void> {
    return this.http.patch<void>(getUrl(this.baseUrl, UserPath.BASE, UserPath.PASSWORD), data);
  }
}
