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
    minLength: 5,
  })
  @IsString()
  @ValidateIf((o: LoginAuthDto) => !o.username)
  @Matches(EMAIL_PATTERN, {
    message: 'Некорректный формат email',
  })
  email: string;

  @ApiProperty({
    description: 'Username (требуется, если не указан email)',
    example: 'john_doe',
    required: false,
    minLength: 3,
    maxLength: 20,
  })
  @ValidateIf((o: LoginAuthDto) => !o.email)
  @IsString()
  @Matches(USER_PATTERN, {
    message: 'Имя должно быть от 3 до 20 символов без пробелов',
  })
  username: string;

  @ApiProperty({
    description: 'Пароль',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message: 'Некорректный пароль',
  })
  @IsNotEmpty()
  password: string;
}
