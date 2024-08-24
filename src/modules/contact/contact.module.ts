import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { MailService } from '../common/service/email.service';

@Module({
  controllers: [ContactController],
  providers: [MailService, ContactService],
})
export class ContactModule {}
