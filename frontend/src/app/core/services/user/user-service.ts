import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChangePasswordDto,
  StatsResponseData,
  UpdateAvatar,
  UpdateUserDto,
  User,
} from './models/user.interfaces';
import { UserPath } from './models/user-path.enum';
import { getUrl } from './utils/utils';
import { API_BASE_URL } from '../../constants/api.constants';
import { GameLabels } from '../../../shared/enums/game-labels.enum';

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

  public statsUpdate(game: GameLabels): Observable<StatsResponseData> {
    return this.http.patch<StatsResponseData>(
      getUrl(this.baseUrl, UserPath.BASE, UserPath.STATS_UPDATE),
      '',
      {
        params: { game },
      },
    );
  }

  public statsGetGame(game: GameLabels): Observable<StatsResponseData> {
    return this.http.get<StatsResponseData>(
      getUrl(this.baseUrl, UserPath.BASE, UserPath.STATS_GET_GAME),
      {
        params: { game },
      },
    );
  }

  public statsGetAll(): Observable<StatsResponseData[]> {
    return this.http.get<StatsResponseData[]>(
      getUrl(this.baseUrl, UserPath.BASE, UserPath.STATS_GET_ALL),
    );
  }

  public updateAvatar(data: UpdateAvatar): Observable<UpdateAvatar> {
    return this.http.patch<UpdateAvatar>(
      getUrl(this.baseUrl, UserPath.BASE, UserPath.AVATAR),
      data,
    );
  }
}
