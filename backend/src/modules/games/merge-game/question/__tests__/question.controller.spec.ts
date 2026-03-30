import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from '../question.controller';
import { QuestionService } from '../question.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

describe('QuestionController', () => {
  let controller: QuestionController;
  let questionServiceMock: DeepMockProxy<QuestionService>;

  const mockCreateQuestionDto: CreateQuestionDto = {
    question: 'Какое животное мяукает?',
    answer: 'кот',
    keywords: ['кот', 'кошка', 'котик'],
  };

  const mockUpdateQuestionDto: UpdateQuestionDto = {
    question: 'Какое животное лает?',
    answer: 'собака',
  };

  const mockQuestion = {
    id: 1,
    question: 'Какое животное мяукает?',
    answer: 'кот',
    keywords: ['кот', 'кошка', 'котик'],
    wordId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockQuestions = [
    mockQuestion,
    {
      id: 2,
      question: 'Какое животное лает?',
      answer: 'собака',
      keywords: ['собака', 'пес'],
      wordId: 1,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    questionServiceMock = mockDeep<QuestionService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
          useValue: questionServiceMock,
        },
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call questionService.findAll when no wordId is provided', async () => {
      questionServiceMock.findAll.mockResolvedValue(mockQuestions);

      const result = await controller.findAll();

      expect(questionServiceMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockQuestions);
    });

    it('should call questionService.findByWordId when wordId is provided', async () => {
      const wordId = '1';
      questionServiceMock.findByWordId.mockResolvedValue(mockQuestions);

      const result = await controller.findAll(wordId);

      expect(questionServiceMock.findByWordId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('create', () => {
    it('should call questionService.create with correct parameters', async () => {
      const wordId = 1;
      questionServiceMock.create.mockResolvedValue(mockQuestion);

      const result = await controller.create(mockCreateQuestionDto, wordId);

      expect(questionServiceMock.create).toHaveBeenCalledWith(
        mockCreateQuestionDto,
        wordId,
      );
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('findOne', () => {
    it('should call questionService.findOne with correct id', async () => {
      const questionId = 1;
      questionServiceMock.findOne.mockResolvedValue(mockQuestion);

      const result = await controller.findOne(questionId);

      expect(questionServiceMock.findOne).toHaveBeenCalledWith(questionId);
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('update', () => {
    it('should call questionService.update with correct parameters', async () => {
      const questionId = 1;
      const updatedQuestion = { ...mockQuestion, ...mockUpdateQuestionDto };
      questionServiceMock.update.mockResolvedValue(updatedQuestion);

      const result = await controller.update(questionId, mockUpdateQuestionDto);

      expect(questionServiceMock.update).toHaveBeenCalledWith(
        questionId,
        mockUpdateQuestionDto,
      );
      expect(result).toEqual(updatedQuestion);
    });
  });

  describe('remove', () => {
    it('should call questionService.remove with correct id', async () => {
      const questionId = 1;
      const mockResult = {
        message: `Question с id ${questionId} успешно удален`,
      };
      questionServiceMock.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(questionId);

      expect(questionServiceMock.remove).toHaveBeenCalledWith(questionId);
      expect(result).toEqual(mockResult);
    });
  });
});
