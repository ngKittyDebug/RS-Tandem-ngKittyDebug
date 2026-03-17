import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckAnswerDto } from './dto/check-answer.dto';
import { ConfigService } from '@nestjs/config';
import { PERSONALITIES } from './dto/personality.dto';
import { PERSONALITY_DESCRIPTION } from './constants/personality-description';
import { GrokChatCompletionResponse, Message } from './interfaces/response-ai';

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

      const data = (await response.json()) as GrokChatCompletionResponse;
      console.log(data);

      if (!response.ok) {
        throw new BadRequestException('Groq API error');
      }

      const parsed = data.choices[0].message.content;
      console.log(parsed);

      const message = JSON.parse(parsed ?? '') as Message;

      return {
        ...message,
      };
    } catch {
      throw new BadRequestException('Groq API error');
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
