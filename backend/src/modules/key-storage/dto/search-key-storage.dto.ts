import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchKeyStorageDto {
  @ApiProperty({
    description: 'Ключ для поиска записи в хранилище',
    example: 'user_settings',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
