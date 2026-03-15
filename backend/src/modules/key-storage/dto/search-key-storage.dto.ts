import { IsNotEmpty, IsString } from 'class-validator';

export class SearchKeyStorageDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}
