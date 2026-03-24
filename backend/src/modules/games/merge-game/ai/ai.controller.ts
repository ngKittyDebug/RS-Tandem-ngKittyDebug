import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Message } from './models/response-ai.interface';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({
    summary: 'Отправка запроса ИИ-агенту',
    description:
      'Отправляет запрос ИИ (Groq) на сравнение ответа пользователя и эталонного ответа.',
  })
  @ApiBody({ type: CheckAnswerDto })
  @ApiOkResponse({
    description: 'Успешный ответ',
    schema: {
      example: {
        isCorrect: true,
        feedback: 'Твой ответ соответствует эталонному',
      },
    },
  })
  @Post('check-answer')
  checkAnswer(@Body() checkAnswerDto: CheckAnswerDto): Promise<Message> {
    return this.aiService.checkAnswer(checkAnswerDto);
  }
}
