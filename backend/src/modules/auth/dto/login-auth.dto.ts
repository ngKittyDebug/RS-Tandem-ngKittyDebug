import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';
import {
  EMAIL_PATTERN,
  PASSWORD_PATTERN,
  USER_PATTERN,
} from 'shared/regexp-pattern';

export class LoginAuthDto {
  @ApiProperty({
    description: 'Email (требуется, если не указан username)',
    example: 'user@example.com',
    required: false,
  })
  @IsString()
  @ValidateIf((o: LoginAuthDto) => !o.username)
  @Matches(EMAIL_PATTERN, { message: 'invalid email' })
  email: string;

  @ApiProperty({
    description: 'Username (требуется, если не указан email)',
    example: 'john_doe',
    required: false,
  })
  @ValidateIf((o: LoginAuthDto) => !o.email)
  @IsString()
  @Matches(USER_PATTERN, { message: 'invalid user' })
  username: string;

  @ApiProperty({ description: 'Пароль', example: 'StrongPass123!' })
  @IsString()
  @Matches(PASSWORD_PATTERN, { message: 'invalid password' })
  @IsNotEmpty()
  password: string;
}
