import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ example: 'test@gmail.com', required: false })
  @ValidateIf((o: LoginAuthDto) => !o.username)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Alex', required: false })
  @ValidateIf((o: LoginAuthDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Test1213133124' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
