import { IsArray, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Текст вопроса',
    example: 'Какое животное мяукает?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'Ответ на вопрос', example: 'кот' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({
    description: 'Ключевые слова для ответа',
    example: ['кот', 'кошка', 'котик'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keywords: string[];
}
