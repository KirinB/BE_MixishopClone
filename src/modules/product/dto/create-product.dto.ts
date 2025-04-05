import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Chuyển đổi từ form-data sang number
  price: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Chuyển đổi từ form-data sang number
  product_type_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // Chuyển đổi từ form-data sang number
  stock_quantity: number;

  @IsOptional()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  sku: string;
}
