import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SearchKeyStorageDto } from './dto/search-key-storage.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class KeyStorageService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(KeyStorageService.name);

  async create(createKeyStorageDto: CreateKeyStorageDto) {
    const { key, storage } = createKeyStorageDto;

    return await this.prisma.storage.upsert({
      where: { key },
      create: {
        key,
        storage,
      },
      update: {
        storage,
      },
    });
  }

  async findAll() {
    return await this.prisma.storage.findMany();
  }

  async findOne(searchKeyStorageDto: SearchKeyStorageDto) {
    const { key } = searchKeyStorageDto;

    const storage = await this.prisma.storage.findUnique({
      where: {
        key,
      },
    });

    if (!storage)
      throw new NotFoundException(`Запись с ключом '${key}' не найдена`);

    return storage;
  }

  async remove(searchKeyStorageDto: SearchKeyStorageDto) {
    const { key } = searchKeyStorageDto;

    try {
      return await this.prisma.storage.delete({
        where: { key },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Хранилище не найдено');
      }
      throw e;
    }
  }
}
