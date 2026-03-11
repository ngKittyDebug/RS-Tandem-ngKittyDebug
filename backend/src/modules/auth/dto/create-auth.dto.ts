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
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(EMAIL_PATTERN, {
    message: 'Некорректный формат email',
  })
  email: string;

  @ApiProperty({
    description: 'Имя пользователя (от 3 до 20 символов, без пробелов)',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(USER_PATTERN, {
    message: 'Имя должно быть от 3 до 20 символов без пробелов',
  })
  username: string;

  @ApiProperty({
    description:
      'Пароль (минимум 8 символов, хотя бы одна заглавная, одна строчная буква и одна цифра)',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, {
    message:
      'Пароль должен содержать минимум 8 символов, включая заглавные, строчные буквы и цифры',
  })
  password: string;
}
