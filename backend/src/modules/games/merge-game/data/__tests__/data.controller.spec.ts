import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from '../data.controller';
import { DataService } from '../data.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateDataDto } from '../dto/create-data.dto';
import { UpdateDataDto } from '../dto/update-data.dto';

describe('DataController', () => {
  let controller: DataController;
  let dataServiceMock: DeepMockProxy<DataService>;

  const mockCreateDataDto: CreateDataDto = {
    category: 'Animals',
    words: [
      {
        word: 'Cat',
        questions: [
          {
            question: 'What sound does it make?',
            answer: 'Meow',
            keywords: ['meow', 'cat'],
          },
        ],
      },
    ],
  };

  const mockUpdateDataDto: UpdateDataDto = {
    category: 'Updated Animals',
    words: [
      {
        word: 'Dog',
        questions: [
          {
            question: 'What sound does it make?',
            answer: 'Woof',
            keywords: ['woof', 'dog'],
          },
        ],
      },
    ],
  };

  const mockDataEntity = {
    id: 1,
    category: 'Animals',
    words: [
      {
        id: 1,
        word: 'Cat',
        dataId: 1,
        questions: [
          {
            id: 1,
            question: 'What sound does it make?',
            answer: 'Meow',
            keywords: ['meow', 'cat'],
            wordId: 1,
          },
        ],
      },
    ],
  };

  const mockPaginatedResponse = {
    data: [mockDataEntity],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    dataServiceMock = mockDeep<DataService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        {
          provide: DataService,
          useValue: dataServiceMock,
        },
      ],
    }).compile();

    controller = module.get<DataController>(DataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call dataService.create with correct parameters', async () => {
      dataServiceMock.create.mockResolvedValue(mockDataEntity);

      const result = await controller.create(mockCreateDataDto);

      expect(dataServiceMock.create).toHaveBeenCalledWith(mockCreateDataDto);
      expect(result).toEqual(mockDataEntity);
    });
  });

  describe('findAll', () => {
    it('should call dataService.findAll with default pagination parameters', async () => {
      dataServiceMock.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll();

      expect(dataServiceMock.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should call dataService.findAll with custom pagination parameters', async () => {
      dataServiceMock.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll('2', '20', 'Animals');

      expect(dataServiceMock.findAll).toHaveBeenCalledWith(2, 20, 'Animals');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should call dataService.findOne with correct id', async () => {
      dataServiceMock.findOne.mockResolvedValue(mockDataEntity);

      const result = await controller.findOne(1);

      expect(dataServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDataEntity);
    });
  });

  describe('update', () => {
    it('should call dataService.update with correct parameters', async () => {
      const updatedEntity = { ...mockDataEntity, category: 'Updated Animals' };
      dataServiceMock.update.mockResolvedValue(updatedEntity);

      const result = await controller.update(1, mockUpdateDataDto);

      expect(dataServiceMock.update).toHaveBeenCalledWith(1, mockUpdateDataDto);
      expect(result).toEqual(updatedEntity);
    });
  });

  describe('remove', () => {
    it('should call dataService.remove with correct id', async () => {
      const mockResult = { message: 'MergeGameData с id 1 успешно удалена' };
      dataServiceMock.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(1);

      expect(dataServiceMock.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });
});
