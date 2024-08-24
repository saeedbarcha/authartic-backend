import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificateInfoDto } from './create-certificate-info.dto';

export class UpdateCertificateInfoDto extends PartialType(CreateCertificateInfoDto) {}
