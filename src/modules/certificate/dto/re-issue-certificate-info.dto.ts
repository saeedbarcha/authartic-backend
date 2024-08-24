import { IsInt, Min } from 'class-validator';

export class ReissueCertificateDto {
  @IsInt()
  @Min(1)
  number_of_certificate: number;
}
