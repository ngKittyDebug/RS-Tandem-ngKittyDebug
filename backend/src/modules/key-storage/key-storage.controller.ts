import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { KeyStorageService } from './key-storage.service';
import { CreateKeyStorageDto } from './dto/create-key-storage.dto';
import { UpdateKeyStorageDto } from './dto/update-key-storage.dto';
import { Public } from 'src/decorators/public.decorator';

@Public()
@Controller('key-storage')
export class KeyStorageController {
  constructor(private readonly keyStorageService: KeyStorageService) {}

  @Post()
  create(@Body() createKeyStorageDto: CreateKeyStorageDto) {
    return this.keyStorageService.create(createKeyStorageDto);
  }

  @Get()
  findAll() {
    return this.keyStorageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keyStorageService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKeyStorageDto: UpdateKeyStorageDto,
  ) {
    return this.keyStorageService.update(+id, updateKeyStorageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keyStorageService.remove(+id);
  }
}
