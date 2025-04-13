import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ResponseSuccessInterceptor } from './common/interceptor/reponse-success.interceptor';
import { PermissionCheck } from './modules/auth/permission/permission-check';
import { JwtAuthGuard } from './modules/auth/passport/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new PermissionCheck(reflector));
  app.useGlobalInterceptors(new ResponseSuccessInterceptor(reflector));
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port);
}
bootstrap();
