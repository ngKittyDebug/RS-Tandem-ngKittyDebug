import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_PATTERN } from 'shared/regexp-pattern';

export class ConfirmPasswordDto {
  @ApiProperty({
    description: 'Текущий пароль для подтверждения',
    example: 'StrongPass123!',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_PATTERN, {
    message: 'Некорректный пароль',
  })
  password!: string;
}
