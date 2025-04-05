import { user_role } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsIn,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @IsString()
  @IsIn(['Nam', 'Nữ'])
  @IsOptional()
  gender: string;

  @IsString()
  @IsOptional()
  @IsIn(['Admin', 'Guest'], { message: 'Role must be either Admin or Guest' })
  role?: user_role;

  @IsOptional()
  @IsString()
  avatar: string;
}
