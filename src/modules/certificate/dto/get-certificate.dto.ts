import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { GetAttachmentDto } from 'src/modules/attachment/dto/get-attachment.dto';

export class VendorDto {
    @Expose()
    @IsNotEmpty()
    id: number;
  
    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    logo: string;
}

export class OwnerDto {
    @Expose()
    @IsNotEmpty()
    id: number;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsNotEmpty()
    is_owner: boolean;
}

export class GetCertificateDto {
    @Expose()
    @IsNotEmpty()
    id: number;

    @Expose()
    @IsString()
    @IsNotEmpty()
    serial_number: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    font: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    font_color: string;

    @Expose()
    @IsNotEmpty()
    bg_color: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    issued_date: Date;

    @Expose()
    @IsString()
    @IsNotEmpty()
    product_sell: string;

    @Expose()
    @IsNotEmpty()
    @Type(() => GetAttachmentDto)
    product_image: GetAttachmentDto;

    @Expose()
    @IsNotEmpty()
    @Type(() => GetAttachmentDto)
    bg_image: GetAttachmentDto;

    @Expose()
    @IsNotEmpty()
    @Type(() => VendorDto)
    vendor: VendorDto;

    @Expose()
    @IsNotEmpty()
    @Type(() => OwnerDto)
    owners: OwnerDto[];

    @Expose()
    @IsNotEmpty()
    @Type(() => GetAttachmentDto)
    qr_code: GetAttachmentDto;
}
