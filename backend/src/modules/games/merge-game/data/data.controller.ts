import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { DataService } from './data.service';
import { CreateDataDto, UpdateDataDto } from '../merge-game.interfaces';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('Merge Game Data')
@Public()
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать новую категорию данных игры' })
  @ApiResponse({ status: 201, description: 'Данные успешно созданы' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(@Body() createDataDto: CreateDataDto) {
    return this.dataService.create(createDataDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все данные игры с пагинацией' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество элементов на странице',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Фильтр по категории',
  })
  @ApiResponse({ status: 200, description: 'Список данных успешно получен' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    const pageNum = page ? +page : 1;
    const limitNum = limit ? +limit : 10;
    return this.dataService.findAll(pageNum, limitNum, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить данные игры по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID данных' })
  @ApiResponse({ status: 200, description: 'Данные успешно получены' })
  @ApiResponse({ status: 404, description: 'Данные не найдены' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить данные игры' })
  @ApiParam({ name: 'id', type: Number, description: 'ID данных' })
  @ApiResponse({ status: 200, description: 'Данные успешно обновлены' })
  @ApiResponse({ status: 404, description: 'Данные не найдены' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDataDto: UpdateDataDto,
  ) {
    return this.dataService.update(id, updateDataDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить данные игры' })
  @ApiParam({ name: 'id', type: Number, description: 'ID данных' })
  @ApiResponse({ status: 200, description: 'Данные успешно удалены' })
  @ApiResponse({ status: 404, description: 'Данные не найдены' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.remove(id);
  }
}
