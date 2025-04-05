import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/modules/prisma/prisma.service';
//CheckTokenStrategy gắn vào app module
@Injectable()
export class CheckPermissionStrategy extends PassportStrategy(
  Strategy,
  'check-permission',
) {
  constructor(public prisma: PrismaService) {
    super();
  }

  async validate(req: any) {
    const user = req.user;
    // console.log({ user });

    if (!user) {
      throw new BadRequestException('Không có thông tin người dùng');
    }

    const userCheck = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (userCheck?.role !== 'Admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập!');
    }

    return true;
  }
}
