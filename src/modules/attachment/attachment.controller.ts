import { Get, Param, Delete, Controller, Post, UseInterceptors, UploadedFile, Body, Put } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateAttachmentDto } from './dto/create-attachment.dto'; // Import your DTO

@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() createAttachmentDto: CreateAttachmentDto) {
    const { type } = createAttachmentDto; // Destructure the type from DTO
    const uploadedImage = await this.attachmentService.upload(file, type);
    return uploadedImage;
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createAttachmentDto: CreateAttachmentDto
  ) {
    const { type } = createAttachmentDto; // Destructure the type from DTO
    const updatedAttachment = await this.attachmentService.update(+id, file, type);
    return updatedAttachment;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const attachment = await this.attachmentService.findOne(+id);
    return attachment;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedAttachment = await this.attachmentService.remove(+id);
    return deletedAttachment;
  }
}
