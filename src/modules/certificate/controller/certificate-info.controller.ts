import { Controller, Get, Req, BadRequestException, Post, Query, UseGuards, Request, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { CertificateInfoService } from '../service/certificate-info.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/entities/user.entity';
import { GetUser } from '../../auth/get-user.decorator';
import { CreateCertificateInfoDto } from '../dto/create-certificate-info.dto';
import { Response } from 'express';
import { GetCertificateInfoDto } from '../dto/get-certificate-info.dto';
import { ParseIntPipe } from '@nestjs/common';
import { ReissueCertificateDto } from '../dto/re-issue-certificate-info.dto';


@UseGuards(AuthGuard('jwt'))
@Controller('certificate-info')
export class CertificateInfoController {
  constructor(private readonly certificateInfoService: CertificateInfoService) { }

  @Post()
  async create(@Body() createCertificateInfoDto: CreateCertificateInfoDto, @GetUser() user: User, @Res() res: Response) {
    const certificateInfo = await this.certificateInfoService.create(createCertificateInfoDto, user, res);
    return certificateInfo;
  }

  @Post('reissue/:id')
  async reissueCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Body() reissueCertificateDto: ReissueCertificateDto,
    @GetUser() user: User,
    @Res() res: Response
  ): Promise<void> {
    const { number_of_certificate } = reissueCertificateDto;
    await this.certificateInfoService.reissueCertificate(id, number_of_certificate, user, res);
  }


  @Get()
  async getAllCertificateInfo(
    @Query('name') name: string | null,
    @Query('saved_draft') saved_draft: boolean | false,
    @Query('page', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) limit = 8,
    @GetUser() user: User,
  ): Promise<{ data: GetCertificateInfoDto[], total: number }> {


    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page number and limit must be positive integers.');
    }

    return this.certificateInfoService.getAllCertificateInfo(name, saved_draft, page, limit, user);
  }

  @Get(':id')
  async getCertificateById(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    @Query('saved_draft') saved_draft: boolean | false,
    @GetUser() user: User,
  ): Promise<GetCertificateInfoDto> {
    return this.certificateInfoService.getCertificateInfoById(+id, saved_draft, user);
  }


}
