import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from '../data.service';
import { PrismaService } from 'prisma/prisma.service';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import { NotFoundException } from '@nestjs/common';
import { CreateDataDto } from '../dto/create-data.dto';
import { UpdateDataDto } from '../dto/update-data.dto';

describe('DataService', () => {
  let service: DataService;
  const prismaMock = createMockPrismaService();

  const mockCreateDataDto: CreateDataDto = {
    category: 'Животные',
    words: [
      {
        word: 'кот',
        questions: [
          {
            question: 'Какое животное мяукает?',
            answer: 'кот',
            keywords: ['кот', 'кошка', 'котик'],
          },
        ],
      },
    ],
  };

  const mockMergeGameData = {
    id: 1,
    category: 'Животные',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    words: [
      {
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
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DataService>(DataService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create merge game data with words and questions', async () => {
      prismaMock.mergeGameData.create.mockResolvedValue(
        mockMergeGameData as never,
      );

      const result = await service.create(mockCreateDataDto);

      expect(prismaMock.mergeGameData.create).toHaveBeenCalledWith({
        data: {
          category: mockCreateDataDto.category,
          words: {
            create: mockCreateDataDto.words.map((word) => ({
              word: word.word,
              questions: {
                create: word.questions.map((question) => ({
                  ...question,
                })),
              },
            })),
          },
        },
        include: {
          words: {
            include: {
              questions: true,
            },
          },
        },
      });
      expect(result).toEqual(mockMergeGameData);
    });
  });

  describe('findAll', () => {
    const mockDataArray = [mockMergeGameData];
    const mockTotal = 1;

    it('should return paginated data without category filter', async () => {
      prismaMock.$transaction.mockImplementation(() => {
        return Promise.resolve([mockDataArray, mockTotal]);
      });

      const result = await service.findAll(1, 10);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockDataArray,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          totalPages: 1,
        },
      });
    });

    it('should return paginated data with category filter', async () => {
      prismaMock.$transaction.mockImplementation(() => {
        return Promise.resolve([mockDataArray, mockTotal]);
      });

      const result = await service.findAll(1, 10, 'Животные');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockDataArray,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          totalPages: 1,
        },
      });
    });

    it('should calculate correct pagination for page 2', async () => {
      prismaMock.$transaction.mockImplementation(() => {
        return Promise.resolve([mockDataArray, mockTotal]);
      });

      const result = await service.findAll(2, 10);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result.pagination.page).toBe(2);
    });

    it('should calculate correct totalPages', async () => {
      prismaMock.$transaction.mockImplementation(() => {
        return Promise.resolve([[mockMergeGameData], 25]);
      });

      const result = await service.findAll(1, 10);

      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return merge game data by id', async () => {
      prismaMock.mergeGameData.findUnique.mockResolvedValue(
        mockMergeGameData as never,
      );

      const result = await service.findOne(1);

      expect(prismaMock.mergeGameData.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          words: {
            include: {
              questions: true,
            },
          },
        },
      });
      expect(result).toEqual(mockMergeGameData);
    });

    it('should throw NotFoundException if data not found', async () => {
      prismaMock.mergeGameData.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'MergeGameData с id 999 не найдена',
      );
    });
  });

  describe('update', () => {
    const mockUpdateDto: UpdateDataDto = {
      category: 'Обновленная категория',
      words: [
        {
          word: 'собака',
          questions: [
            {
              question: 'Какое животное лает?',
              answer: 'собака',
              keywords: ['собака', 'пес'],
            },
          ],
        },
      ],
    };

    it('should update merge game data', async () => {
      const mockUpdatedData = {
        ...mockMergeGameData,
        category: mockUpdateDto.category,
      };

      prismaMock.mergeGameData.findUnique.mockResolvedValue(
        mockMergeGameData as never,
      );
      prismaMock.mergeGameData.update.mockResolvedValue(
        mockUpdatedData as never,
      );

      const result = await service.update(1, mockUpdateDto);

      expect(prismaMock.mergeGameData.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          category: mockUpdateDto.category,
          words: {
            deleteMany: {},
            create: mockUpdateDto.words!.map((word) => ({
              word: word.word,
              questions: {
                create: word.questions.map((question) => ({
                  ...question,
                })),
              },
            })),
          },
        },
        include: {
          words: {
            include: {
              questions: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUpdatedData);
    });

    it('should update only category if words not provided', async () => {
      const updateDtoOnlyCategory: UpdateDataDto = {
        category: 'Только категория',
      };

      prismaMock.mergeGameData.findUnique.mockResolvedValue(
        mockMergeGameData as never,
      );
      prismaMock.mergeGameData.update.mockResolvedValue(
        mockMergeGameData as never,
      );

      await service.update(1, updateDtoOnlyCategory);

      expect(prismaMock.mergeGameData.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          category: updateDtoOnlyCategory.category,
        },
        include: {
          words: {
            include: {
              questions: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if data not found', async () => {
      prismaMock.mergeGameData.findUnique.mockResolvedValue(null);

      await expect(service.update(999, mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete merge game data and return success message', async () => {
      prismaMock.mergeGameData.findUnique.mockResolvedValue(
        mockMergeGameData as never,
      );
      prismaMock.mergeGameData.delete.mockResolvedValue(
        mockMergeGameData as never,
      );

      const result = await service.remove(1);

      expect(prismaMock.mergeGameData.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        message: 'MergeGameData с id 1 успешно удалена',
      });
    });

    it('should throw NotFoundException if data not found', async () => {
      prismaMock.mergeGameData.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
