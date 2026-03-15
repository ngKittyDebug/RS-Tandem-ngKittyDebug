import { PartialType } from '@nestjs/swagger';
import { CreateKeyStorageDto } from './create-key-storage.dto';

export class UpdateKeyStorageDto extends PartialType(CreateKeyStorageDto) {}
