import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { avatar, email, gender, name, password, phone, role } =
      createUserDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user)
      throw new BadRequestException(`Đã có người dùng với email: ${email}`);

    const saltOrRounds = 10;
    const passHash = await bcrypt.hash(password, saltOrRounds);

    const userNew = await this.prisma.user.create({
      data: {
        email,
        name,
        password: passHash,
        avatar,
        gender,
        phone,
        role: role ?? 'Guest',
      },
    });

    return { ...userNew, password: undefined };
  }

  async findAll(page: number, pageSize: number, search: string) {
    const where = search?.trim()
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    const skip = (page - 1) * pageSize;
    const totalItem = await this.prisma.user.count({ where });
    const totalPage = Math.ceil(totalItem / pageSize);

    const users = await this.prisma.user.findMany({
      take: pageSize,
      skip,
      orderBy: { created_at: 'desc' },
      where,
    });

    return {
      page,
      pageSize,
      totalPage,
      totalItem,
      items: users.map(({ password, ...item }) => item) || [],
    };
  }

  async findOne(id: number) {
    const userExist = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!userExist) {
      throw new BadRequestException(
        `Không có người dùng trong hệ thống với Id: ${id}`,
      );
    }
    return { ...userExist, password: undefined };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };

    if (updateData.password) {
      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { ...updatedUser, password: undefined };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: {
        id,
      },
    });
    return `Đã xóa người dùng với Id: ${id}`;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new BadRequestException(
        `Không tìm thấy người dùng với email ${email}`,
      );
    return user;
  }
}
