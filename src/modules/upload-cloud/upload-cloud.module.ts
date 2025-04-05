import { Module } from '@nestjs/common';
import { UploadCloudService } from './upload-cloud.service';
import { UploadCloudController } from './upload-cloud.controller';

@Module({
  controllers: [UploadCloudController],
  providers: [UploadCloudService],
  exports: [UploadCloudService],
})
export class UploadCloudModule {}
