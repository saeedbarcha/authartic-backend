import { IsNumber, IsBoolean } from 'class-validator';

export class CertificateOwner {
  @IsNumber()
  owner_id: number;

  @IsBoolean()
  is_owner: boolean;
}
