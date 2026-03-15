import { inject, Injectable, signal } from '@angular/core';
import { UserService } from '../../services/user/user-service';
import { ChangePasswordDto, UpdateUserDto, User } from '../../services/user/models/user.interfaces';
import { firstValueFrom } from 'rxjs';
import { AppTosterService } from '../../services/app-toster-service';
import { TranslocoService } from '@jsverse/transloco';
import { HttpErrorResponse } from '@angular/common/http';

type StatusMessageMap = Partial<Record<number, string>>;

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly userService = inject(UserService);
  private readonly toaster = inject(AppTosterService);
  private readonly transloco = inject(TranslocoService);

  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _isUpdatingUser = signal(false);
  private readonly _isChangingPassword = signal(false);

  public readonly user = this._user.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isUpdatingUser = this._isUpdatingUser.asReadonly();
  public readonly isChangingPassword = this._isChangingPassword.asReadonly();

  public async loadUser(): Promise<void> {
    if (this._isLoading()) return;

    this._isLoading.set(true);

    try {
      const user = await firstValueFrom(this.userService.getUser());
      this._user.set(user);
    } catch (error) {
      this._user.set(null);
      const message = this.getMessageByStatus(error, {
        401: 'serverResponse.getUser.unauthorized',
        404: 'serverResponse.getUser.notFound',
      });
      this.toaster.showErrorToster(message);
    } finally {
      this._isLoading.set(false);
    }
  }

  public async updateUser(data: UpdateUserDto): Promise<void> {
    if (this._isUpdatingUser()) return;

    this._isUpdatingUser.set(true);

    try {
      const updatedUser = await firstValueFrom(this.userService.updateUser(data));
      this._user.set(updatedUser);
      this.toaster.showPositiveToster('serverResponse.updateAccount.success');
    } catch (error) {
      const message = this.getMessageByStatus(error, {
        400: 'serverResponse.updateAccount.invalidData',
        403: 'serverResponse.updateAccount.invalidPassword',
        404: 'serverResponse.updateAccount.notFound',
        409: 'serverResponse.updateAccount.isCredentialsTaken',
      });

      this.toaster.showErrorToster(message);
    } finally {
      this._isUpdatingUser.set(false);
    }
  }

  public async changePassword(data: ChangePasswordDto): Promise<void> {
    if (this._isChangingPassword()) return;

    this._isChangingPassword.set(true);

    try {
      await firstValueFrom(this.userService.changePassword(data));
      this.toaster.showPositiveToster('serverResponse.updatePassword.success');
    } catch (error) {
      const message = this.getMessageByStatus(error, {
        400: 'serverResponse.updatePassword.invalidData',
        403: 'serverResponse.updatePassword.invalidPassword',
        404: 'serverResponse.updatePassword.notFound',
      });

      this.toaster.showErrorToster(message);
    } finally {
      this._isChangingPassword.set(false);
    }
  }

  public clear(): void {
    this._user.set(null);
  }

  private getMessageByStatus(error: unknown, statusMap: StatusMessageMap): string {
    if (error instanceof HttpErrorResponse) {
      const key = statusMap[error.status];

      if (key) {
        return this.transloco.translate(key);
      }
    }

    return this.transloco.translate('serverResponse.defaultError');
  }
}
