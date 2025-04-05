import { Injectable } from '@nestjs/common';

import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UploadCloudService {
  constructor(private configService: ConfigService) {}

  async uploadCloud(file: any) {
    // Configuration
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUD_NAME'),
      api_key: this.configService.get<string>('API_KEY_CLOUD'),
      api_secret: this.configService.get<string>('API_SECRET_CLOUD'),
    });

    const uploadResult: any = await new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'images',
          },
          (error, uploadResult) => {
            return resolve(uploadResult);
          },
        )
        .end(file.buffer);
    });

    return {
      folder: 'images/',
      filename: file.filename,
      imgUrl: uploadResult.secure_url,
    };
  }
}
