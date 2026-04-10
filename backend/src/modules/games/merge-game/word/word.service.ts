import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class WordService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.word.findMany({
      include: {
        questions: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }
  async create(createWordDto: CreateWordDto, dataId: number) {
    return await this.prisma.word.create({
      data: {
        word: createWordDto.word,
        dataId,
        questions: {
          create: createWordDto.questions.map((question) => ({
            ...question,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
  }

  async findByDataId(dataId: number) {
    return await this.prisma.word.findMany({
      where: { dataId },
      include: {
        questions: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const word = await this.prisma.word.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!word) {
      throw new NotFoundException(`Word с id ${id} не найден`);
    }

    return word;
  }

  async update(id: number, updateWordDto: UpdateWordDto) {
    await this.findOne(id); // Проверка существования

    const { word, questions } = updateWordDto;

    return await this.prisma.word.update({
      where: { id },
      data: {
        ...(word && { word }),
        ...(questions && {
          questions: {
            deleteMany: {},
            create: questions.map((question) => ({ ...question })),
          },
        }),
      },
      include: {
        questions: true,
      },
    });
  }

  async remove(id: number) {
    try {
      await this.prisma.word.delete({ where: { id } });

      return { message: `Word с id ${id} успешно удален` };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Запись с id=${id} не найдена`);
      }
      throw error;
    }
  }
}
