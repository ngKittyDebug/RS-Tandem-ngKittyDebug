import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangePasswordDto, UpdateAvatar, UpdateUserDto, User } from './models/user.interfaces';
import { UserPath } from './models/user-path.enum';
import { getUrl } from './utils/utils';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  public getUser(): Observable<User> {
    return this.http.get<User>(getUrl(UserPath.BASE));
  }

  public updateUser(data: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(getUrl(UserPath.BASE, UserPath.PROFILE), data);
  }

  public changePassword(data: ChangePasswordDto): Observable<void> {
    return this.http.patch<void>(getUrl(UserPath.BASE, UserPath.PASSWORD), data);
  }

  public updateAvatar(data: UpdateAvatar): Observable<UpdateAvatar> {
    return this.http.patch<UpdateAvatar>(getUrl(UserPath.BASE, UserPath.AVATAR), data);
  }
}
