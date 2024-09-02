import { Injectable } from '@nestjs/common';
import { ContactDto } from './dto/create-contact.dto';
import { MailService } from '../common/service/email.service';


@Injectable()
export class ContactService {
    constructor(private readonly mailService: MailService) { }

    // ***********************************//
    // *   send contact us message       *//
    // ***********************************//
    async sendContactMail(contactDto: ContactDto) {
        const { name, email, message } = contactDto;
        const subject = `Contact Form Submission from ${name}`;
        const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
        const to = process.env.ADMIN_EMAIL;

        const mailOptions = {
            from: email,
            to,
            subject,
            text,
        };


        await this.mailService.sendMail(mailOptions);

        return { message: 'Email sent successfully' };
    }
}
