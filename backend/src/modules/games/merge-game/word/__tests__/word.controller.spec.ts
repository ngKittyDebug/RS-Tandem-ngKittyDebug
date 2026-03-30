import { Test, TestingModule } from '@nestjs/testing';
import { WordController } from '../word.controller';
import { WordService } from '../word.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateWordDto } from '../dto/create-word.dto';
import { UpdateWordDto } from '../dto/update-word.dto';

describe('WordController', () => {
  let controller: WordController;
  let wordServiceMock: DeepMockProxy<WordService>;

  const mockWordId = 1;
  const mockDataId = 10;

  const mockWord = {
    id: mockWordId,
    word: 'кот',
    dataId: mockDataId,
    questions: [
      {
        id: 1,
        question: 'Что это за животное?',
        answer: 'кот',
        keywords: ['кот', 'кошка'],
        wordId: mockWordId,
      },
    ],
  };

  const mockCreateWordDto: CreateWordDto = {
    word: 'кот',
    questions: [
      {
        question: 'Что это за животное?',
        answer: 'кот',
        keywords: ['кот', 'кошка'],
      },
    ],
  };

  const mockUpdateWordDto: UpdateWordDto = {
    word: 'собака',
    questions: [
      {
        question: 'Что это за животное?',
        answer: 'собака',
        keywords: ['собака', 'пес'],
      },
    ],
  };

  beforeEach(async () => {
    wordServiceMock = mockDeep<WordService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordController],
      providers: [
        {
          provide: WordService,
          useValue: wordServiceMock,
        },
      ],
    }).compile();

    controller = module.get<WordController>(WordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call wordService.findAll when no dataId is provided', async () => {
      const mockWords = [mockWord];
      wordServiceMock.findAll.mockResolvedValue(mockWords);

      const result = await controller.findAll();

      expect(wordServiceMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockWords);
    });

    it('should call wordService.findByDataId when dataId is provided', async () => {
      const mockWords = [mockWord];
      wordServiceMock.findByDataId.mockResolvedValue(mockWords);

      const result = await controller.findAll(mockDataId.toString());

      expect(wordServiceMock.findByDataId).toHaveBeenCalledWith(mockDataId);
      expect(result).toEqual(mockWords);
    });
  });

  describe('create', () => {
    it('should call wordService.create with correct parameters', async () => {
      wordServiceMock.create.mockResolvedValue(mockWord);

      const result = await controller.create(mockCreateWordDto, mockDataId);

      expect(wordServiceMock.create).toHaveBeenCalledWith(
        mockCreateWordDto,
        mockDataId,
      );
      expect(result).toEqual(mockWord);
    });
  });

  describe('findOne', () => {
    it('should call wordService.findOne with correct id', async () => {
      wordServiceMock.findOne.mockResolvedValue(mockWord);

      const result = await controller.findOne(mockWordId);

      expect(wordServiceMock.findOne).toHaveBeenCalledWith(mockWordId);
      expect(result).toEqual(mockWord);
    });
  });

  describe('update', () => {
    it('should call wordService.update with correct parameters', async () => {
      const updatedWord = { ...mockWord, word: 'собака' };
      wordServiceMock.update.mockResolvedValue(updatedWord);

      const result = await controller.update(mockWordId, mockUpdateWordDto);

      expect(wordServiceMock.update).toHaveBeenCalledWith(
        mockWordId,
        mockUpdateWordDto,
      );
      expect(result).toEqual(updatedWord);
    });
  });

  describe('remove', () => {
    it('should call wordService.remove with correct id', async () => {
      const mockResult = { message: `Word с id ${mockWordId} успешно удален` };
      wordServiceMock.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(mockWordId);

      expect(wordServiceMock.remove).toHaveBeenCalledWith(mockWordId);
      expect(result).toEqual(mockResult);
    });
  });
});
