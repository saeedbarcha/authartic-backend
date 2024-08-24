import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendToSpaceService {
  constructor(private configService: ConfigService) {}

  async send(file: Express.Multer.File): Promise<string> {
    const uploadsDir = this.configService.get<string>('UPLOADS_DIRECTORY') || 'uploads';
    const filePath = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
    
    await fs.mkdir(uploadsDir, { recursive: true });

    if (!file.buffer) {
      throw new Error('File buffer is undefined');
    }

    await fs.writeFile(filePath, file.buffer);
    
    return filePath;
  }
}
