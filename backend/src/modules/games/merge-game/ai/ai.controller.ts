import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { ApiSwagger } from 'src/decorators/swagger.decorator';
import { checkAnswerConfig } from 'src/swagger-api-configs/merge-game-ai';
import { Message } from './models/response-ai.interface';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiSwagger(checkAnswerConfig)
  @Post('check-answer')
  checkAnswer(@Body() checkAnswerDto: CheckAnswerDto): Promise<Message> {
    return this.aiService.checkAnswer(checkAnswerDto);
  }
}
