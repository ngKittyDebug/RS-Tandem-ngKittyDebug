import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_PATTERN } from 'shared/regexp-pattern';

export class UpdateUserPassword {
  @ApiProperty({
    description: 'Текущий пароль',
    example: 'OldPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, {
    message: 'Некорректный пароль',
  })
  oldPassword!: string;

  @ApiProperty({
    description:
      'Новый пароль (минимум 8 символов, включая заглавные, строчные буквы и цифры)',
    example: 'NewPass456!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, {
    message: 'Некорректный пароль',
  })
  newPassword!: string;
}
