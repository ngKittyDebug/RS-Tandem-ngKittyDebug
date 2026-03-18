import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Merge Game Questions')
@Public()
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все вопросы или вопросы по ID слова' })
  @ApiQuery({
    name: 'wordId',
    required: false,
    type: Number,
    description: 'Фильтр по ID слова',
  })
  @ApiResponse({ status: 200, description: 'Список вопросов успешно получен' })
  findAll(@Query('wordId') wordId?: string) {
    if (wordId) {
      return this.questionService.findByWordId(+wordId);
    }
    return this.questionService.findAll();
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новый вопрос' })
  @ApiQuery({ name: 'wordId', type: Number, description: 'ID слова' })
  @ApiResponse({ status: 201, description: 'Вопрос успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Query('wordId', ParseIntPipe) wordId: number,
  ) {
    return this.questionService.create(createQuestionDto, wordId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить вопрос по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID вопроса' })
  @ApiResponse({ status: 200, description: 'Вопрос успешно получен' })
  @ApiResponse({ status: 404, description: 'Вопрос не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить вопрос' })
  @ApiParam({ name: 'id', type: Number, description: 'ID вопроса' })
  @ApiResponse({ status: 200, description: 'Вопрос успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Вопрос не найден' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить вопрос' })
  @ApiParam({ name: 'id', type: Number, description: 'ID вопроса' })
  @ApiResponse({ status: 200, description: 'Вопрос успешно удален' })
  @ApiResponse({ status: 404, description: 'Вопрос не найден' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionService.remove(id);
  }
}
