import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { KeyStorageService } from './key-storage.service';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { Public } from 'src/decorators/public.decorator';
import { SearchKeyStorageDto } from './dto/search-key-storage.dto';
import { ApiQuery } from '@nestjs/swagger';

@Public()
@Controller('key-storage')
export class KeyStorageController {
  constructor(private readonly keyStorageService: KeyStorageService) {}

  @Post()
  create(@Body() createKeyStorageDto: CreateKeyStorageDto) {
    return this.keyStorageService.create(createKeyStorageDto);
  }

  @Get('all')
  findAll() {
    return this.keyStorageService.findAll();
  }

  @ApiQuery({
    name: 'key',
    required: false,
    type: String,
    description: 'Фильтр по ключу',
  })
  @Get('params')
  findOne(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.findOne(searchKeyStorageDto);
  }

  @ApiQuery({
    name: 'key',
    required: true,
    type: String,
    description: 'Удаление по ключу',
  })
  @Delete()
  remove(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.remove(searchKeyStorageDto);
  }
}
