import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEmpty, IsOptional, IsString } from 'class-validator';
import { user_role } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự cho trường email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự trường tên' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự cho số điện thoại' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự cho sinh nhật' })
  birth_day?: string;

  @IsOptional()
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự cho giới tính' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Vui lòng nhập chuỗi ký tự cho chức vụ' })
  role?: user_role;
}
