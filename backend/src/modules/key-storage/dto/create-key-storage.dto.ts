import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateKeyStorageDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNotEmpty()
  @IsObject()
  storage: object;
}
