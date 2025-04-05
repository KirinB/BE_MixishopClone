import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  product_type_id: number;

  @IsOptional()
  @IsNumber()
  stock_quantity: number;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  sku: string;
}
