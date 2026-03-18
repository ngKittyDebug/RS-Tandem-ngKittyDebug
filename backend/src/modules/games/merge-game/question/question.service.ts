import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.question.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }
  async create(createQuestionDto: CreateQuestionDto, wordId: number) {
    return await this.prisma.question.create({
      data: {
        ...createQuestionDto,
        wordId,
      },
    });
  }

  async findByWordId(wordId: number) {
    return await this.prisma.question.findMany({
      where: { wordId },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question с id ${id} не найден`);
    }

    return question;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    await this.findOne(id);

    return await this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.question.delete({
      where: { id },
    });

    return { message: `Question с id ${id} успешно удален` };
  }
}
