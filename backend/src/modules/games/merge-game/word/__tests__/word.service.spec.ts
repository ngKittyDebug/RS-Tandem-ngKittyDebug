import { Test, TestingModule } from '@nestjs/testing';
import { WordService } from '../word.service';
import { PrismaService } from 'prisma/prisma.service';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import { NotFoundException } from '@nestjs/common';
import { CreateWordDto } from '../dto/create-word.dto';
import { UpdateWordDto } from '../dto/update-word.dto';

describe('WordService', () => {
  let service: WordService;
  const prismaMock = createMockPrismaService();

  const mockCreateWordDto: CreateWordDto = {
    word: 'кот',
    questions: [
      {
        question: 'Какое животное мяукает?',
        answer: 'кот',
        keywords: ['кот', 'кошка', 'котик'],
      },
    ],
  };

  const mockWord = {
    id: 1,
    word: 'кот',
    dataId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    questions: [
      {
        id: 1,
        question: 'Какое животное мяукает?',
        answer: 'кот',
        keywords: ['кот', 'кошка', 'котик'],
        wordId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<WordService>(WordService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all words with questions ordered by id desc', async () => {
      const mockWords = [mockWord];
      prismaMock.word.findMany.mockResolvedValue(mockWords as never);

      const result = await service.findAll();

      expect(prismaMock.word.findMany).toHaveBeenCalledWith({
        include: {
          questions: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
      expect(result).toEqual(mockWords);
    });
  });

  describe('create', () => {
    it('should create word with questions and associate with dataId', async () => {
      const dataId = 1;
      prismaMock.word.create.mockResolvedValue(mockWord as never);

      const result = await service.create(mockCreateWordDto, dataId);

      expect(prismaMock.word.create).toHaveBeenCalledWith({
        data: {
          word: mockCreateWordDto.word,
          dataId,
          questions: {
            create: mockCreateWordDto.questions.map((question) => ({
              ...question,
            })),
          },
        },
        include: {
          questions: true,
        },
      });
      expect(result).toEqual(mockWord);
    });
  });

  describe('findByDataId', () => {
    it('should return words filtered by dataId ordered by id asc', async () => {
      const dataId = 1;
      const mockWords = [mockWord];
      prismaMock.word.findMany.mockResolvedValue(mockWords as never);

      const result = await service.findByDataId(dataId);

      expect(prismaMock.word.findMany).toHaveBeenCalledWith({
        where: { dataId },
        include: {
          questions: true,
        },
        orderBy: {
          id: 'asc',
        },
      });
      expect(result).toEqual(mockWords);
    });
  });

  describe('findOne', () => {
    it('should return word by id with questions', async () => {
      prismaMock.word.findUnique.mockResolvedValue(mockWord as never);

      const result = await service.findOne(1);

      expect(prismaMock.word.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          questions: true,
        },
      });
      expect(result).toEqual(mockWord);
    });

    it('should throw NotFoundException if word not found', async () => {
      prismaMock.word.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Word с id 999 не найден',
      );
    });
  });

  describe('update', () => {
    const mockUpdateDto: UpdateWordDto = {
      word: 'собака',
      questions: [
        {
          question: 'Какое животное лает?',
          answer: 'собака',
          keywords: ['собака', 'пес'],
        },
      ],
    };

    it('should update word with new data', async () => {
      const mockUpdatedWord = {
        ...mockWord,
        word: mockUpdateDto.word,
      };

      prismaMock.word.findUnique.mockResolvedValue(mockWord as never);
      prismaMock.word.update.mockResolvedValue(mockUpdatedWord as never);

      const result = await service.update(1, mockUpdateDto);

      expect(prismaMock.word.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          word: mockUpdateDto.word,
          questions: {
            deleteMany: {},
            create: mockUpdateDto.questions!.map((question) => ({
              ...question,
            })),
          },
        },
        include: {
          questions: true,
        },
      });
      expect(result).toEqual(mockUpdatedWord);
    });

    it('should update only word if questions not provided', async () => {
      const updateDtoOnlyWord: UpdateWordDto = {
        word: 'новое слово',
      };

      prismaMock.word.findUnique.mockResolvedValue(mockWord as never);
      prismaMock.word.update.mockResolvedValue(mockWord as never);

      await service.update(1, updateDtoOnlyWord);

      expect(prismaMock.word.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          word: updateDtoOnlyWord.word,
        },
        include: {
          questions: true,
        },
      });
    });

    it('should throw NotFoundException if word not found', async () => {
      prismaMock.word.findUnique.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete word and return success message', async () => {
      prismaMock.word.findUnique.mockResolvedValue(mockWord as never);
      prismaMock.word.delete.mockResolvedValue(mockWord as never);

      const result = await service.remove(1);

      expect(prismaMock.word.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        message: 'Word с id 1 успешно удален',
      });
    });

    it('should throw NotFoundException if word not found', async () => {
      prismaMock.word.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
