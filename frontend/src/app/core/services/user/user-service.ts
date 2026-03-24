import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangePasswordDto, UpdateUserDto, User } from './models/user.interfaces';
import { UserPath } from './models/user-path.enum';
import { getUrl } from './utils/utils';
import { API_BASE_URL } from '../../constants/api.constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

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
