import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KeyStorageService } from './key-storage.service';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { SearchKeyStorageDto } from './dto/search-key-storage.dto';
import { ApiAuth, ApiSwagger } from 'src/decorators/swagger.decorator';
import {
  createKeyStorageConfig,
  findAllKeyStorageConfig,
  findOneKeyStorageConfig,
  deleteKeyStorageConfig,
} from 'src/swagger-api-configs/key-storage';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';

@ApiAuth()
@ApiTags('Key Storage')
@Controller('key-storage')
export class KeyStorageController {
  constructor(private readonly keyStorageService: KeyStorageService) {}

  @ApiSwagger(createKeyStorageConfig)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createKeyStorageDto: CreateKeyStorageDto) {
    return this.keyStorageService.create(createKeyStorageDto);
  }

  @ApiSwagger(findAllKeyStorageConfig)
  @Get('all')
  findAll() {
    return this.keyStorageService.findAll();
  }

  @ApiSwagger(findOneKeyStorageConfig)
  @Get('params')
  findOne(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.findOne(searchKeyStorageDto);
  }

  @ApiSwagger(deleteKeyStorageConfig)
  @Delete()
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Query() searchKeyStorageDto: SearchKeyStorageDto) {
    return this.keyStorageService.remove(searchKeyStorageDto);
  }
}
