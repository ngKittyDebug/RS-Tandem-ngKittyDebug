import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateWordDto } from '../../word/dto/create-word.dto';

export class UpdateDataDto {
  @ApiPropertyOptional({
    description: 'Категория данных игры',
    example: 'Животные',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Массив слов с вопросами',
    type: [CreateWordDto],
    minItems: 1,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWordDto)
  words?: CreateWordDto[];
}
