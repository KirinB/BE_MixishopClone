import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { comparePasswordHelper, hashPasswordHelper } from './helpers/util';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register-auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(username);

    const isValidPassword = await comparePasswordHelper(pass, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Username/Password không hợp lệ');
    }

    if (!user) return null;

    return user;
  }

  async login(user: any) {
    const payload = {
      username: user.email,
      id: user.id,
    };
    return {
      user: { ...user, password: undefined },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;
    const emailExits = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (emailExits)
      throw new BadRequestException(`Đã tồn tại người dùng: ${email}`);

    const hashPass = await hashPasswordHelper(password);

    const userNew = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashPass as string,
      },
    });

    return { ...userNew, password: undefined };
  }
}
