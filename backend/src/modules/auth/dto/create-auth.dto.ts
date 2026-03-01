import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Alex' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Test1213133124' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
