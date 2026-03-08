import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { USER_PATTERN, EMAIL_PATTERN } from 'shared/regexp-pattern';

export class UserDto {
  @ApiProperty({
    description: 'Имя пользователя (от 3 до 20 символов, без пробелов)',
    example: 'john_doe',
    required: false,
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Matches(USER_PATTERN, {
    message: 'Имя должно быть от 3 до 20 символов без пробелов',
  })
  username?: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
    required: false,
    minLength: 5,
  })
  @IsOptional()
  @IsString()
  @Matches(EMAIL_PATTERN, {
    message: 'Некорректный формат email',
  })
  email?: string;

  @ApiProperty({
    description: 'Текущий пароль для подтверждения',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
