import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorater/Public';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { RegisterDto } from './dto/register-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req: any) {
    // console.log(req.user);
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  handleRegister(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('check-permission')
  check() {
    return 'ok';
  }
}
