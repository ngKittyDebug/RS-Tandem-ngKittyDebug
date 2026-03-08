import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPassword {
  @ApiProperty({
    description: 'Текущий пароль',
    example: 'OldPass123!',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description:
      'Новый пароль (минимум 8 символов, включая заглавные, строчные буквы и цифры)',
    example: 'NewPass456!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
