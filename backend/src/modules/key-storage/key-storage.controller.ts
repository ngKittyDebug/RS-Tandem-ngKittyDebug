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
import { ApiTags } from '@nestjs/swagger';
import { KeyStorageService } from './key-storage.service';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { Public } from 'src/decorators/public.decorator';
import { SearchKeyStorageDto } from './dto/search-key-storage.dto';
import { ApiAuth, ApiSwagger } from 'src/decorators/swagger.decorator';
import {
  createKeyStorageConfig,
  findAllKeyStorageConfig,
  findOneKeyStorageConfig,
  deleteKeyStorageConfig,
} from 'src/swagger-api-configs/key-storage';

@ApiAuth()
@ApiTags('Key Storage')
@Controller('key-storage')
export class KeyStorageController {
  constructor(private readonly keyStorageService: KeyStorageService) {}

  @ApiSwagger(createKeyStorageConfig)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createKeyStorageDto: CreateKeyStorageDto) {
    return this.keyStorageService.create(createKeyStorageDto);
  }

  @Public()
  @ApiSwagger(findAllKeyStorageConfig)
  @Get('all')
  findAll() {
    return this.keyStorageService.findAll();
  }

  @Public()
  @ApiSwagger(findOneKeyStorageConfig)
  @Get('params')
  findOne(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.findOne(searchKeyStorageDto);
  }

  @ApiSwagger(deleteKeyStorageConfig)
  @Delete()
  remove(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.remove(searchKeyStorageDto);
  }
}
