import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateWordDto } from '../../word/dto/create-word.dto';

export class CreateDataDto {
  @ApiProperty({ description: 'Категория данных игры', example: 'Животные' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Массив слов с вопросами',
    type: [CreateWordDto],
    minItems: 1,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWordDto)
  words: CreateWordDto[];
}
