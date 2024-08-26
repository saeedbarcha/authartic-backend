import { Controller,UseGuards,Query, Get,  Post, Param } from '@nestjs/common';
import { CertificateService } from '../service/certificate.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/modules/user/entities/user.entity';
import { GetUser } from '../../auth/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  getCertificates(@Query('name') name: string, @GetUser() user: User ) {
    return this.certificateService.getCertificates(name, user);
  }

  @Post('claim-certificate/:id/scan')
  async scanCertificate(@Param('id') id: string, @GetUser() user: User) {
    return await this.certificateService.scanCertificate(+id, user);
  }
  
}
