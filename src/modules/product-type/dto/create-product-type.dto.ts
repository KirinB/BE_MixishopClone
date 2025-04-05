import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;
}
