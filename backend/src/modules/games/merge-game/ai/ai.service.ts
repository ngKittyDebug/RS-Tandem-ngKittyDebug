import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { ConfigService } from '@nestjs/config';
import { PERSONALITIES } from './constants/personality.constants';
import { PERSONALITY_DESCRIPTION } from './constants/personality-description';
import {
  GroqChatCompletionResponse,
  Message,
} from './models/response-ai.interface';

@Injectable()
export class AiService {
  private readonly API_KEY: string;
  private readonly API_URL: string;
  private readonly API_MODEL: string;

  constructor(private readonly configService: ConfigService) {
    this.API_KEY = configService.getOrThrow<string>('AI_KEY');
    this.API_URL = configService.getOrThrow<string>('AI_URL');
    this.API_MODEL = configService.getOrThrow<string>('AI_MODEL');
  }

  public async checkAnswer(checkAnswerDto: CheckAnswerDto) {
    const systemPrompt = `${PERSONALITIES[checkAnswerDto.personality]} ${PERSONALITY_DESCRIPTION}`;
    const prompt = this.createPrompt(checkAnswerDto);

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.API_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 100,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new BadRequestException('Groq API error');
      }

      const data = (await response.json()) as GroqChatCompletionResponse;

      const choice = data.choices?.[0];
      if (!choice) throw new BadRequestException('Empty AI response');

      const parsed = choice.message.content;
      if (!parsed) throw new BadRequestException('Empty AI content');
      const message = JSON.parse(parsed) as Message;

      return message;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof SyntaxError)
        throw new InternalServerErrorException('AI response parse error');
      throw new InternalServerErrorException('Groq API unavailable');
    }
  }

  private createPrompt(checkAnswerDto: CheckAnswerDto) {
    return `
    Вопрос:
    ${checkAnswerDto.question}

    Эталонный ответ:
    ${checkAnswerDto.answer}

    Ответ студента:
    ${checkAnswerDto.userAnswer}

    Оцени ответ согласно инструкции.
    `;
  }
}
