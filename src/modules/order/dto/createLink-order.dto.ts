import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class createLinkOrder {
  @IsString()
  @IsNotEmpty()
  orderCode: string;
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
}
