import { SetMetadata } from '@nestjs/common';

export const SKIP_PERMISSION = 'skippermission';
export const SkipPerMission = () => SetMetadata(SKIP_PERMISSION, true);
