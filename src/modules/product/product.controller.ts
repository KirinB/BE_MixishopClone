import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorater/Public';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: any,
  ) {
    return this.productService.create(createProductDto, file);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search: string = '',
    @Query('typeId') typeId: string = '',
    @Query('minPrice') minPrice: string = '',
    @Query('maxPrice') maxPrice: string = '',
    @Query('sortBy') sortBy: 'price_asc' | 'price_desc' | 'newest' | 'oldest',
  ) {
    return this.productService.findAll(
      +page,
      +pageSize,
      search,
      +typeId,
      +minPrice,
      +maxPrice,
      sortBy,
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
