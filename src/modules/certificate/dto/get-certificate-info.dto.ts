import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDate } from 'class-validator';
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
    email: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    role: string;
}

export class GetCertificateInfoDto {
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
    @IsString()
    @IsNotEmpty()
    bg_color: string;

    @Expose()
    @IsNotEmpty()
    issued: number;

    @Expose()
    @IsOptional()
    @IsDate()
    issued_date?: Date;

    @Expose()
    @IsNotEmpty()
    @IsBoolean()
    saved_draft: boolean;

    @Expose()
    @IsString()
    @IsNotEmpty()
    product_sell: string;

    @Expose()
    @Type(() => GetAttachmentDto)
    @IsNotEmpty()
    product_image: GetAttachmentDto;

    @Expose()
    @Type(() => GetAttachmentDto)
    @IsOptional()
    bg_image?: GetAttachmentDto;

    @Expose()
    @Type(() => VendorDto)
    @IsNotEmpty()
    vendor_info: VendorDto;
}
