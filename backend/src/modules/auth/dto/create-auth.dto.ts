import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  EMAIL_PATTERN,
  PASSWORD_PATTERN,
  USER_PATTERN,
} from 'shared/regexp-pattern';

export class CreateAuthDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(EMAIL_PATTERN, { message: 'invalid email' })
  email: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  @Matches(USER_PATTERN, { message: 'invalid username' })
  username: string;

  @ApiProperty({ description: 'Пароль', example: 'StrongPass123!' })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, { message: 'invalid password' })
  password: string;
}
