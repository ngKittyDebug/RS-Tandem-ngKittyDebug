import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from '../ai.controller';
import { AiService } from '../ai.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CheckAnswerDto } from '../dto/check-answer.dto';
import { Message } from '../models/response-ai.interface';

describe('AiController', () => {
  let controller: AiController;
  let aiServiceMock: DeepMockProxy<AiService>;

  const mockCheckAnswerDto: CheckAnswerDto = {
    userAnswer:
      'Метод map проходит по каждому элементу массива, применяет callback-функцию и возвращает новый массив той же длины с преобразованными элементами.',
    question: 'Что делает метод map с массивом?',
    answer:
      'Метод map проходит по каждому элементу массива, применяет callback-функцию и возвращает новый массив той же длины с преобразованными элементами.',
    personality: 'kind',
  };

  const mockMessage: Message = {
    isCorrect: true,
    feedback: 'Отличный ответ! Вы правильно описали работу метода map.',
  };

  beforeEach(async () => {
    aiServiceMock = mockDeep<AiService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: aiServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkAnswer', () => {
    it('should call aiService.checkAnswer with correct parameters', async () => {
      aiServiceMock.checkAnswer.mockResolvedValue(mockMessage);

      const result = await controller.checkAnswer(mockCheckAnswerDto);

      expect(aiServiceMock.checkAnswer).toHaveBeenCalledWith(
        mockCheckAnswerDto,
      );
      expect(result).toEqual(mockMessage);
    });
  });
});
