import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class AvatarUpdateDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  avatar: string;
}
