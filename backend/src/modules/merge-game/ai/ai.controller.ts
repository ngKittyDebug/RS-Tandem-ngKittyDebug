import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Public()
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
        feedback: 'Твой ответ соответвует эталонному',
      },
    },
  })
  @Post('check-answer')
  checkAnswer(@Body() checkAnswerDto: CheckAnswerDto) {
    return this.aiService.checkAnswer(checkAnswerDto);
  }
}
