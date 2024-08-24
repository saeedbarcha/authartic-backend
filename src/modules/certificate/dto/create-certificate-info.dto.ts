import { IsString, IsNumber, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCertificateInfoDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  number_of_certificate: number;

  @IsString()
  font: string;

  @IsString()
  font_color: string;

  @IsString()
  bg_color: string;

  @IsOptional() 
  @IsNumber()
  bg_image_id?: number;

  @IsOptional()
  @IsNumber()
  custom_bg?: number; 

  @IsString()
  product_sell: string;

  @IsBoolean()
  saved_draft: boolean;

  @IsNumber()
  product_image_id: number;
}
