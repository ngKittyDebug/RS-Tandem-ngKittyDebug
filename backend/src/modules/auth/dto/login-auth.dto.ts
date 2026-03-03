import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    description: 'Email (требуется, если не указан username)',
    example: 'user@example.com',
    required: false,
  })
  @ValidateIf((o: LoginAuthDto) => !o.username)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Username (требуется, если не указан email)',
    example: 'john_doe',
    required: false,
  })
  @ValidateIf((o: LoginAuthDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Пароль', example: 'StrongPass123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
