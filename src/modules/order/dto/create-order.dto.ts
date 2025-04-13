import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
