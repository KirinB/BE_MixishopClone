import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_SUCCESSS } from '../decorators/response-success.decorator';

const responseSuccess = (metaData = null, message = 'OK', code = 200) => {
  if (typeof code !== 'number') code = 200;
  return {
    status: 'success',
    code,
    message,
    metaData,
    doc: 'http://localhost:8397/api/',
  };
};

@Injectable()
export class ResponseSuccessInterceptor implements NestInterceptor {
  constructor(public reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //lấy code response
    const res = context.switchToHttp().getResponse();
    const code = res.statusCode;

    //lấy message
    const message = this.reflector.getAllAndOverride<string>(
      RESPONSE_SUCCESSS,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data) => {
        return responseSuccess(data, message, code);
      }),
    );
  }
}
