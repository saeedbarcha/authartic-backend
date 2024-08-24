import { Controller,UseGuards,Query, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';
import { CertificateService } from '../service/certificate.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/entities/user.entity';
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
