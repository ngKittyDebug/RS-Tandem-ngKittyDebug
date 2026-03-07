import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPassword {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
