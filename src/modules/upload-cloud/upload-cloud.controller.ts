import { Controller } from '@nestjs/common';
import { UploadCloudService } from './upload-cloud.service';

@Controller()
export class UploadCloudController {
  constructor(private readonly uploadCloudService: UploadCloudService) {}
}
