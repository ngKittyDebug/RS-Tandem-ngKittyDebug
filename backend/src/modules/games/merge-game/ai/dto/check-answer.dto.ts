import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PersonalityType } from '../models/personality.enum';

export class CheckAnswerDto {
  @ApiProperty({
    description: 'Ответ пользователя',
    example:
      'Метод map проходит по каждому элементу массива, применяет callback-функцию и возвращает новый массив той же длины с преобразованными элементами.',
  })
  @IsString()
  @IsNotEmpty()
  userAnswer!: string;

  @ApiProperty({
    description: 'Вопрос от игры',
    example: 'Что делает метод map с массивом?',
  })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({
    description: 'Эталонный ответ',
    example:
      'Метод map проходит по каждому элементу массива, применяет callback-функцию и возвращает новый массив той же длины с преобразованными элементами.',
  })
  @IsString()
  @IsNotEmpty()
  answer!: string;

  @ApiProperty({
    description: 'Стиль ответа ИИ',
    example: 'kind',
    enum: PersonalityType,
  })
  @IsEnum(PersonalityType)
  @IsNotEmpty()
  personality!: PersonalityType;
}
