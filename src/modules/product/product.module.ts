import { Module } from '@nestjs/common';
import { UploadCloudModule } from '../upload-cloud/upload-cloud.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [UploadCloudModule],
})
export class ProductModule {}
