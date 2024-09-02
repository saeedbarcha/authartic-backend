import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyVendorDto {
  @IsNumber()
  @IsNotEmpty()
  vendor_id: number;

  @IsString()
  @IsNotEmpty()
  validation_code: string;
}
