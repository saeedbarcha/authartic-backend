import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ContactDto } from './dto/create-contact.dto';
import { ContactService } from './contact.service';



@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendContactMail(@Body() contactDto: ContactDto) {
    return await this.contactService.sendContactMail(contactDto);
  }
}