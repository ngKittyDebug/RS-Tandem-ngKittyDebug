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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataService } from './data.service';
import { CreateDataDto, UpdateDataDto } from '../merge-game.interfaces';
import { ApiAuth, ApiSwagger } from 'src/decorators/swagger.decorator';
import {
  createDataConfig,
  findAllDataConfig,
  findOneDataConfig,
  updateDataConfig,
  deleteDataConfig,
} from 'src/swagger-api-configs/merge-game-data';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/role.guard';

@ApiAuth()
@ApiTags('Merge Game Data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @ApiSwagger(createDataConfig)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDataDto: CreateDataDto) {
    return this.dataService.create(createDataDto);
  }

  @ApiSwagger(findAllDataConfig)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    const pageNum = page ? +page : 1;
    const limitNum = limit ? +limit : 10;
    return this.dataService.findAll(pageNum, limitNum, category);
  }

  @ApiSwagger(findOneDataConfig)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.findOne(id);
  }

  @ApiSwagger(updateDataConfig)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDataDto: UpdateDataDto,
  ) {
    return this.dataService.update(id, updateDataDto);
  }

  @ApiSwagger(deleteDataConfig)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.remove(id);
  }
}
