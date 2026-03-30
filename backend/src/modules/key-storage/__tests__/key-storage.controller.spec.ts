import { Test, TestingModule } from '@nestjs/testing';
import { KeyStorageController } from '../key-storage.controller';
import { KeyStorageService } from '../key-storage.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateKeyStorageDto } from '../dto/create-key-storage.dto';
import { SearchKeyStorageDto } from '../dto/search-key-storage.dto';

describe('KeyStorageController', () => {
  let controller: KeyStorageController;
  let keyStorageServiceMock: DeepMockProxy<KeyStorageService>;

  const mockCreateKeyStorageDto: CreateKeyStorageDto = {
    key: 'user_settings',
    storage: { theme: 'dark', language: 'en', notifications: true },
  };

  const mockSearchKeyStorageDto: SearchKeyStorageDto = {
    key: 'user_settings',
  };

  const mockKeyStorageResult = {
    id: '1',
    key: 'user_settings',
    storage: { theme: 'dark', language: 'en', notifications: true },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockAllKeyStorageResults = [
    mockKeyStorageResult,
    {
      id: '2',
      key: 'app_config',
      storage: { version: '1.0.0', debug: false },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    keyStorageServiceMock = mockDeep<KeyStorageService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyStorageController],
      providers: [
        {
          provide: KeyStorageService,
          useValue: keyStorageServiceMock,
        },
      ],
    }).compile();

    controller = module.get<KeyStorageController>(KeyStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call keyStorageService.create with correct parameters', async () => {
      keyStorageServiceMock.create.mockResolvedValue(mockKeyStorageResult);

      const result = await controller.create(mockCreateKeyStorageDto);

      expect(keyStorageServiceMock.create).toHaveBeenCalledWith(
        mockCreateKeyStorageDto,
      );
      expect(result).toEqual(mockKeyStorageResult);
    });
  });

  describe('findOne', () => {
    it('should call keyStorageService.findOne with correct parameters', async () => {
      keyStorageServiceMock.findOne.mockResolvedValue(mockKeyStorageResult);

      const result = await controller.findOne(mockSearchKeyStorageDto);

      expect(keyStorageServiceMock.findOne).toHaveBeenCalledWith(
        mockSearchKeyStorageDto,
      );
      expect(result).toEqual(mockKeyStorageResult);
    });
  });

  describe('findAll', () => {
    it('should call keyStorageService.findAll and return all results', async () => {
      keyStorageServiceMock.findAll.mockResolvedValue(mockAllKeyStorageResults);

      const result = await controller.findAll();

      expect(keyStorageServiceMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAllKeyStorageResults);
    });
  });
});
