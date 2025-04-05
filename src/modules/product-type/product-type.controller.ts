import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorater/Public';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { ProductTypeService } from './product-type.service';

@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile() file: any,
    @Body() createProductTypeDto: CreateProductTypeDto,
  ) {
    return this.productTypeService.create(createProductTypeDto, file);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search: string = '',
  ) {
    return this.productTypeService.findAll(+page, +pageSize, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productTypeService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateProductTypeDto: CreateProductTypeDto,
    @UploadedFile() file: any,
  ) {
    return this.productTypeService.update(+id, updateProductTypeDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productTypeService.remove(+id);
  }
}
