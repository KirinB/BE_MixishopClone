import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsNumber, IsOptional, IsString, IsIn, IsEmail } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  order_code?: string;

  @IsOptional()
  @IsIn(['Pending', 'Processing', 'Completed', 'Cancelled'])
  status?: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

  @IsOptional()
  @IsNumber()
  total_price?: number;

  @IsOptional()
  @IsEmail()
  email?: string;

  user_id?: number;
}
