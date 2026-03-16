import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KeyStorageService } from './key-storage.service';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { Public } from 'src/decorators/public.decorator';
import { SearchKeyStorageDto } from './dto/search-key-storage.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@Public()
@ApiTags('Key Storage')
@Controller('key-storage')
export class KeyStorageController {
  constructor(private readonly keyStorageService: KeyStorageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создание или обновление записи в хранилище',
    description:
      'Создаёт новую запись в хранилище по ключу или обновляет существующую (upsert)',
  })
  @ApiBody({
    type: CreateKeyStorageDto,
    description: 'Данные для создания/обновления записи',
    examples: {
      default: {
        summary: 'Пример сохранения объекта',
        value: {
          key: 'user_settings',
          storage: { theme: 'dark', language: 'ru' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Запись успешно создана или обновлена',
  })
  create(@Body() createKeyStorageDto: CreateKeyStorageDto) {
    return this.keyStorageService.create(createKeyStorageDto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Получение всех записей хранилища',
    description: 'Возвращает массив всех записей в хранилище',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список всех записей хранилища',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          key: { type: 'string', example: 'user_settings' },
          storage: {
            type: 'object',
            example: { theme: 'dark', language: 'ru' },
          },
        },
      },
    },
  })
  findAll() {
    return this.keyStorageService.findAll();
  }

  @ApiQuery({
    name: 'key',
    required: true,
    type: String,
    description: 'Ключ для поиска записи',
    example: 'user_settings',
  })
  @Get('params')
  @ApiOperation({
    summary: 'Получение записи по ключу',
    description: 'Возвращает запись из хранилища по указанному ключу',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Запись найдена',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        key: { type: 'string', example: 'user_settings' },
        storage: { type: 'object', example: { theme: 'dark', language: 'ru' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Запись с указанным ключом не найдена',
  })
  findOne(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.findOne(searchKeyStorageDto);
  }

  @ApiQuery({
    name: 'key',
    required: true,
    type: String,
    description: 'Ключ для удаления записи',
    example: 'user_settings',
  })
  @Delete()
  @ApiOperation({
    summary: 'Удаление записи из хранилища',
    description: 'Удаляет запись из хранилища по указанному ключу',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Запись успешно удалена',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Запись с указанным ключом не найдена',
  })
  remove(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.remove(searchKeyStorageDto);
  }
}
