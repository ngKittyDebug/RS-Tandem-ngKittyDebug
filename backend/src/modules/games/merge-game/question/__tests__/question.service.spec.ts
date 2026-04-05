import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '../question.service';
import { PrismaService } from 'prisma/prisma.service';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import { NotFoundException } from '@nestjs/common';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { Prisma } from 'src/generated/prisma/client';

describe('QuestionService', () => {
  let service: QuestionService;
  const prismaMock = createMockPrismaService();

  const mockCreateQuestionDto: CreateQuestionDto = {
    question: 'Какое животное мяукает?',
    answer: 'кот',
    keywords: ['кот', 'кошка', 'котик'],
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all questions ordered by id desc', async () => {
      const mockQuestions = [mockQuestion];
      prismaMock.question.findMany.mockResolvedValue(mockQuestions as never);

      const result = await service.findAll();

      expect(prismaMock.question.findMany).toHaveBeenCalledWith({
        orderBy: {
          id: 'desc',
        },
      });
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('create', () => {
    it('should create a question with wordId', async () => {
      const wordId = 1;
      prismaMock.question.create.mockResolvedValue(mockQuestion as never);

      const result = await service.create(mockCreateQuestionDto, wordId);

      expect(prismaMock.question.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateQuestionDto,
          wordId,
        },
      });
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('findByWordId', () => {
    it('should return questions for a specific word ordered by id asc', async () => {
      const wordId = 1;
      const mockQuestions = [mockQuestion];
      prismaMock.question.findMany.mockResolvedValue(mockQuestions as never);

      const result = await service.findByWordId(wordId);

      expect(prismaMock.question.findMany).toHaveBeenCalledWith({
        where: { wordId },
        orderBy: {
          id: 'asc',
        },
      });
      expect(result).toEqual(mockQuestions);
    });
  });

  describe('findOne', () => {
    it('should return a question by id', async () => {
      prismaMock.question.findUnique.mockResolvedValue(mockQuestion as never);

      const result = await service.findOne(1);

      expect(prismaMock.question.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockQuestion);
    });

    it('should throw NotFoundException if question not found', async () => {
      prismaMock.question.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Question с id 999 не найден',
      );
    });
  });

  describe('update', () => {
    const mockUpdateDto: UpdateQuestionDto = {
      question: 'Обновленный вопрос',
      answer: 'обновленный ответ',
    };

    it('should update a question', async () => {
      const mockUpdatedQuestion = {
        ...mockQuestion,
        ...mockUpdateDto,
      };

      prismaMock.question.findUnique.mockResolvedValue(mockQuestion as never);
      prismaMock.question.update.mockResolvedValue(
        mockUpdatedQuestion as never,
      );

      const result = await service.update(1, mockUpdateDto);

      expect(prismaMock.question.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockUpdateDto,
      });
      expect(result).toEqual(mockUpdatedQuestion);
    });

    it('should throw NotFoundException if question not found', async () => {
      prismaMock.question.findUnique.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a question and return success message', async () => {
      prismaMock.question.findUnique.mockResolvedValue(mockQuestion as never);
      prismaMock.question.delete.mockResolvedValue(mockQuestion as never);

      const result = await service.remove(1);

      expect(prismaMock.question.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        message: 'Question с id 1 успешно удален',
      });
    });

    it('should throw NotFoundException if question not found', async () => {
      prismaMock.question.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('', {
          code: 'P2025',
          clientVersion: '5.0.0',
        }),
      );

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
