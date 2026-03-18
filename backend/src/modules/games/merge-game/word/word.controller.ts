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
import { WordService } from './word.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Merge Game Words')
@Public()
@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все слова или слова по ID категории' })
  @ApiQuery({
    name: 'dataId',
    required: false,
    type: Number,
    description: 'Фильтр по ID категории',
  })
  @ApiResponse({ status: 200, description: 'Список слов успешно получен' })
  findAll(@Query('dataId') dataId?: string) {
    if (dataId) {
      return this.wordService.findByDataId(+dataId);
    }
    return this.wordService.findAll();
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новое слово' })
  @ApiQuery({
    name: 'dataId',
    type: Number,
    description: 'ID категории данных',
  })
  @ApiResponse({ status: 201, description: 'Слово успешно создано' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(
    @Body() createWordDto: CreateWordDto,
    @Query('dataId', ParseIntPipe) dataId: number,
  ) {
    return this.wordService.create(createWordDto, dataId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить слово по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID слова' })
  @ApiResponse({ status: 200, description: 'Слово успешно получено' })
  @ApiResponse({ status: 404, description: 'Слово не найдено' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wordService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить слово' })
  @ApiParam({ name: 'id', type: Number, description: 'ID слова' })
  @ApiResponse({ status: 200, description: 'Слово успешно обновлено' })
  @ApiResponse({ status: 404, description: 'Слово не найдено' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.wordService.update(id, updateWordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить слово' })
  @ApiParam({ name: 'id', type: Number, description: 'ID слова' })
  @ApiResponse({ status: 200, description: 'Слово успешно удалено' })
  @ApiResponse({ status: 404, description: 'Слово не найдено' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wordService.remove(id);
  }
}
