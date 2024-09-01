import { plainToInstance } from 'class-transformer';
import { GetCertificateInfoDto } from 'src/modules/certificate/dto/get-certificate-info.dto';
import { GetCertificateDto } from 'src/modules/certificate/dto/get-certificate.dto';
import { CertificateInfo } from 'src/modules/certificate/entities/certificate-info.entity';

import { Certificate } from 'src/modules/certificate/entities/certificate.entity';

export function transformGetCertificateToDto(certificate: Certificate): GetCertificateDto {
    return plainToInstance(GetCertificateDto, {
        id: certificate?.id,
        serial_number: certificate?.serial_number,
        name: certificate?.certificateInfo?.name,
        description: certificate?.certificateInfo?.description,
        font: certificate?.certificateInfo?.font,
        font_color: certificate?.certificateInfo?.font_color,
        bg_color: certificate?.certificateInfo?.bg_color,
        issued_date: certificate?.certificateInfo?.issued_date,
        product_sell: certificate?.certificateInfo?.product_sell,
        product_image: {
            id: certificate?.certificateInfo?.product_image?.id,
            url: certificate?.certificateInfo?.product_image?.url,
            file_type: certificate?.certificateInfo?.product_image?.file_type,
            file_name: certificate?.certificateInfo?.product_image?.file_name,
        },
        bg_image: {
            id: certificate?.certificateInfo?.custom_bg?.id,
            url: certificate?.certificateInfo?.custom_bg?.url,
            file_type: certificate?.certificateInfo?.custom_bg?.file_type,
            file_name: certificate?.certificateInfo?.custom_bg?.file_name,
        },
        vendor: {
            id: certificate?.certificateInfo?.created_by_vendor?.id,
            name: certificate?.certificateInfo?.created_by_vendor?.user_name,
            logo: certificate?.certificateInfo?.created_by_vendor?.vendorInfo?.attachment?.url,
        },
        owners: certificate.owners.map(owner => ({
            id: owner?.user?.id,
            name: owner?.user?.user_name,
            is_owner: owner?.is_owner,
        })),
        qr_code: certificate?.qr_code,
    }, { excludeExtraneousValues: true });
}


export function transformGetCertificateInfoToDto(certificateInfo: CertificateInfo): GetCertificateInfoDto {
    return plainToInstance(GetCertificateInfoDto, {
        id: certificateInfo.id,
        name: certificateInfo.name,
        description: certificateInfo.description,
        font: certificateInfo.font,
        font_color: certificateInfo.font_color,
        bg_color: certificateInfo.bg_color,
        issued: certificateInfo.issued,
        issued_date: certificateInfo.issued_date,
        product_sell: certificateInfo.product_sell,
        saved_draft: certificateInfo.saved_draft,
        vendor_info: {
          id: certificateInfo.created_by_vendor.id,
          name: certificateInfo.created_by_vendor.user_name,
          email: certificateInfo.created_by_vendor.email,
          role: certificateInfo.created_by_vendor.role,
        },
        product_image: {
          id: certificateInfo.product_image.id,
          url: certificateInfo.product_image.url,
          type: certificateInfo.product_image.file_type,
        },
        bg_image: certificateInfo.custom_bg ? {
          id: certificateInfo.custom_bg.id,
          url: certificateInfo.custom_bg.url,
          type: certificateInfo.custom_bg.file_type,
        } : undefined,
    }, { excludeExtraneousValues: true });
}
