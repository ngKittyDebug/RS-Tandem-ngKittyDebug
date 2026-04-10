import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateDataDto } from './dto/create-data.dto';
import { UpdateDataDto } from './dto/update-data.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class DataService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDataDto: CreateDataDto) {
    const { category, words } = createDataDto;

    return await this.prisma.mergeGameData.create({
      data: {
        category,
        words: {
          create: words.map((word) => ({
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
  }

  async findAll(page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;

    const where = category
      ? { category: { contains: category, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.mergeGameData.findMany({
        skip,
        take: limit,
        where,
        include: {
          words: {
            include: {
              questions: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.mergeGameData.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.mergeGameData.findUnique({
      where: { id },
      include: {
        words: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`MergeGameData с id ${id} не найдена`);
    }

    return data;
  }

  async update(id: number, updateDataDto: UpdateDataDto) {
    await this.findOne(id);

    const { category, words } = updateDataDto;

    return await this.prisma.mergeGameData.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(words && {
          words: {
            deleteMany: {},
            create: words.map((word) => ({
              word: word.word,
              questions: {
                create: word.questions.map((question) => ({
                  ...question,
                })),
              },
            })),
          },
        }),
      },
      include: {
        words: {
          include: {
            questions: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    try {
      await this.prisma.mergeGameData.delete({ where: { id } });
      return { message: `MergeGameData с id ${id} успешно удалена` };
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
