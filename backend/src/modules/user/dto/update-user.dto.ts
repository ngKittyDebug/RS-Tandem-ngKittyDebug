import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { USER_PATTERN, EMAIL_PATTERN } from 'shared/regexp-pattern';

export class UserDto {
  @IsOptional()
  @IsString()
  @Matches(USER_PATTERN, { message: 'invalid user' })
  username?: string;

  @IsOptional()
  @IsString()
  @Matches(EMAIL_PATTERN, { message: 'invalid email' })
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
