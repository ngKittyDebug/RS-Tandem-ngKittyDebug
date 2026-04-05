import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateQuestionDto } from '../../question/dto/create-question.dto';

export class CreateWordDto {
  @ApiProperty({ description: 'Слово', example: 'кот' })
  @IsNotEmpty()
  @IsString()
  word!: string;

  @ApiProperty({
    description: 'Массив вопросов для слова',
    type: [CreateQuestionDto],
    minItems: 1,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}
