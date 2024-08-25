import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import { Attachment } from './entities/attachment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendToSpaceService } from './send-to-space.service';
import { promises as fs } from 'fs';
import { plainToInstance } from 'class-transformer';
import { GetAttachmentDto } from './dto/get-attachment.dto';

@Injectable()
export class AttachmentService {
  private readonly baseUrl: string = process.env.BACKEND_URL || 'http://localhost:5000';

  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    private sendToSpaceService: SendToSpaceService,
  ) {}

  private validateFileAndType(file: Express.Multer.File, type: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!type) {
      throw new BadRequestException('File type is required');
    }
  }

  private async getAttachmentById(id: number): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Attachment not found`);
    }
    return attachment;
  }

  private async handleFileUpload(file: Express.Multer.File): Promise<string> {
    return this.sendToSpaceService.send(file);
  }

  async upload(file: Express.Multer.File, type: string): Promise<GetAttachmentDto> {
    this.validateFileAndType(file, type);

    const filePath = await this.handleFileUpload(file);

    const attachment = this.attachmentRepository.create({
      file_name: file.originalname,
      path: filePath,
      mimeType: file.mimetype,
      size: file.size,
      url: `${this.baseUrl}/uploads/${path.basename(filePath)}`,
      file_type: type,
      status: 1,
      is_deleted: false,
    });

    const savedAttachment = await this.attachmentRepository.save(attachment);

    return plainToInstance(GetAttachmentDto, savedAttachment, { excludeExtraneousValues: true });
  }

  async update(id: number, file: Express.Multer.File, type: string): Promise<GetAttachmentDto> {
    this.validateFileAndType(file, type);

    const attachment = await this.getAttachmentById(id);
    const filePath = await this.handleFileUpload(file);

    if (attachment.path) {
      await fs.unlink(attachment.path);
    }

    attachment.file_name = file.originalname;
    attachment.path = filePath;
    attachment.mimeType = file.mimetype;
    attachment.size = file.size;
    attachment.url = `${this.baseUrl}/uploads/${path.basename(filePath)}`;
    attachment.file_type = type;

    const savedAttachment = await this.attachmentRepository.save(attachment);

    return plainToInstance(GetAttachmentDto, savedAttachment, { excludeExtraneousValues: true });
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const attachment = await this.getAttachmentById(id);

    if (attachment.path) {
      await fs.unlink(attachment.path);
    }

    await this.attachmentRepository.remove(attachment);

    return { message: 'Attachment Deleted successfully' };
  }

  async findOne(id: number): Promise<GetAttachmentDto> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const attachment = await this.getAttachmentById(id);

    return plainToInstance(GetAttachmentDto, attachment, { excludeExtraneousValues: true });
  }
}
