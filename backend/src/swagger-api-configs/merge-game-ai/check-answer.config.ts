import { HttpStatus } from '@nestjs/common';
import type { ApiSwaggerConfig } from '../../decorators/swagger.decorator';
import { CheckAnswerDto } from '../../modules/games/merge-game/ai/dto/check-answer.dto';

export const checkAnswerConfig: ApiSwaggerConfig = {
  operation: {
    summary: 'Отправка запроса ИИ-агенту',
    description:
      'Отправляет запрос ИИ (Groq) на сравнение ответа пользователя и эталонного ответа. Возвращает результат проверки и обратную связь.',
  },
  body: {
    type: CheckAnswerDto,
    description: 'Данные для проверки ответа',
    examples: {
      default: {
        summary: 'Пример проверки ответа',
        value: {
          userAnswer:
            'Метод map проходит по каждому элементу массива и возвращает новый массив',
          question: 'Что делает метод map с массивом?',
          answer:
            'Метод map проходит по каждому элементу массива, применяет callback-функцию и возвращает новый массив той же длины с преобразованными элементами.',
          personality: 'kind',
        },
      },
    },
  },
  okResponse: {
    description: 'Успешный ответ от ИИ',
    schema: {
      example: {
        isCorrect: true,
        feedback: 'Твой ответ соответствует эталонному',
      },
    },
  },
  responses: [
    {
      status: HttpStatus.BAD_REQUEST,
      description: 'Некорректные данные запроса',
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка при обращении к ИИ-сервису',
    },
  ],
};
