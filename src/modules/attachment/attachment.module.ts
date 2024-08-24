import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentService } from './attachment.service';
import { SendToSpaceService } from './send-to-space.service';
import { AttachmentController } from './attachment.controller';
import { Attachment } from './entities/attachment.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment]), ConfigModule],
  providers: [AttachmentService, SendToSpaceService],
  controllers: [AttachmentController],
})
export class AttachmentModule {}
