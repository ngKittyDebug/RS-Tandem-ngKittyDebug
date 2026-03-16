import { PartialType } from '@nestjs/swagger';
import { CreateDataDto } from './create-data.dto';

export class UpdateDataDto extends PartialType(CreateDataDto) {}
