import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class AvatarUpdateDto {
  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatars/user123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  avatar!: string;
}
