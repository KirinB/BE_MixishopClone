import { SetMetadata } from '@nestjs/common';

export const RESPONSE_SUCCESSS = 'resSuccess';
export const ResponseSuccess = (message: string) =>
  SetMetadata(RESPONSE_SUCCESSS, message);
