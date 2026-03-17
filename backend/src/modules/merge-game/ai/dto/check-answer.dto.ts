import { IsNotEmpty, IsString } from 'class-validator';

export class CheckAnswerDto {
  @IsString()
  @IsNotEmpty()
  userAnswer: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsNotEmpty()
  personality: string;
}
