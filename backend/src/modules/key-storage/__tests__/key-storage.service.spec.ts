import { Test } from '@nestjs/testing';
import { KeyStorageService } from '../key-storage.service';
import { createMockPrismaService } from 'prisma/__mocks__/prisma-service-mock';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  JsonValue,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/client';
import { NotFoundException } from '@nestjs/common';

const MockPrismaKeyData = {
  id: '1',
  key: 'test',
  storage: { id: 1 } as JsonValue,
};

const MockPrismaKeyDataSecond = {
  id: '2',
  key: 'test2',
  storage: { id: 2 } as JsonValue,
};

describe('KeyStorageService', () => {
  let keyStorageService: KeyStorageService;
  const prismaMock = createMockPrismaService();

  beforeEach(async () => {
    const service = await Test.createTestingModule({
      providers: [
        KeyStorageService,
        { provide: PrismaService, useValue: prismaMock },
        ConfigService,
      ],
    }).compile();

    keyStorageService = service.get<KeyStorageService>(KeyStorageService);
    jest.clearAllMocks();
  });

  it('Сервис должен быть создан', () => {
    expect(keyStorageService).toBeDefined();
  });

  describe('Создание хранилища', () => {
    it('Должно быть создано хранилище', async () => {
      prismaMock.storage.upsert.mockResolvedValue(MockPrismaKeyData);

      const data = await keyStorageService.create({
        key: 'test',
        storage: { id: 1 },
      });

      expect(prismaMock.storage.upsert).toHaveBeenCalledWith({
        where: { key: 'test' },
        create: {
          key: 'test',
          storage: { id: 1 },
        },
        update: {
          storage: { id: 1 },
        },
      });

      expect(data).toEqual(MockPrismaKeyData);
    });
  });

  describe('Должен найти по ключу', () => {
    it('Должно вернуть хранилище по ключу', async () => {
      prismaMock.storage.findUnique.mockResolvedValue(MockPrismaKeyData);

      const data = await keyStorageService.findOne({
        key: 'test',
      });

      expect(prismaMock.storage.findUnique).toHaveBeenCalledWith({
        where: {
          key: 'test',
        },
      });

      expect(data).toEqual(MockPrismaKeyData);
    });
  });

  describe('Должно вернуть все хранилища', () => {
    it('Должно вернуть хранилища', async () => {
      prismaMock.storage.findMany.mockResolvedValue([
        MockPrismaKeyData,
        MockPrismaKeyDataSecond,
      ]);

      const data = await keyStorageService.findAll();

      expect(prismaMock.storage.findMany).toHaveBeenCalled();

      expect(data).toEqual([MockPrismaKeyData, MockPrismaKeyDataSecond]);
    });
  });

  describe('Удаление по ключу', () => {
    it('Должно удалить хранилище по ключу', async () => {
      prismaMock.storage.delete.mockResolvedValue(MockPrismaKeyData);

      const data = await keyStorageService.remove({ key: 'test' });

      expect(prismaMock.storage.delete).toHaveBeenCalledWith({
        where: { key: MockPrismaKeyData.key },
      });

      expect(data).toEqual(MockPrismaKeyData);
    });
  });

  it('Должно выбросить NotFoundException, если хранилище не найдено', async () => {
    const mockError = new PrismaClientKnownRequestError(
      'Record to delete does not exist.',
      {
        code: 'P2025',
        clientVersion: '7.4.1',
      },
    );

    prismaMock.storage.delete.mockRejectedValue(mockError);

    await expect(
      keyStorageService.remove({ key: 'Вампиры не говорят бла-блабла-бла' }),
    ).rejects.toThrow(NotFoundException);

    await expect(
      keyStorageService.remove({ key: 'Вампиры не говорят бла-блабла-бла' }),
    ).rejects.toThrow('Хранилище не найдено');
  });
});
