import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeyStorageDto {
  @ApiProperty({
    description: 'Уникальный ключ для доступа к записи в хранилище',
    example: 'user_settings',
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({
    description: 'Данные для хранения в хранилище (произвольный объект)',
    example: { theme: 'dark', language: 'ru', notifications: true },
  })
  @IsNotEmpty()
  @IsObject()
  storage!: object;
}
