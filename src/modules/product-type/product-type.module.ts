import { Module } from '@nestjs/common';
import { ProductTypeService } from './product-type.service';
import { ProductTypeController } from './product-type.controller';
import { UploadCloudModule } from '../upload-cloud/upload-cloud.module';

@Module({
  controllers: [ProductTypeController],
  providers: [ProductTypeService],
  imports: [UploadCloudModule],
})
export class ProductTypeModule {}
