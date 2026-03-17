import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { Public } from 'src/decorators/public.decorator';

@Public()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('check-answer')
  checkAnswer(@Body() checkAnswerDto: CheckAnswerDto) {
    return this.aiService.checkAnswer(checkAnswerDto);
  }
}
