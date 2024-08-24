import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { User } from '../../auth/entities/user.entity';
import { CertificateOwner } from '../entities/certificate-owner.entity';
import { UserRoleEnum } from 'src/modules/auth/enum/user.role.enum';
import { AttachmentService } from 'src/modules/attachment/attachment.service';
import { GetCertificateDto } from '../dto/get-certificate.dto';
import { transformGetCertificateToDto } from 'src/utils/certificate-transform.util';


@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CertificateOwner)
    private readonly certificateOwnerRepository: Repository<CertificateOwner>,
    private readonly dataSource: DataSource,
    private readonly attachmentService: AttachmentService, 
  ) {}

  async getCertificates(name: string | null, user: User): Promise<GetCertificateDto[]> {
    const isUser = await this.userRepository.findOne({ where: { id: user.id, role: UserRoleEnum.VENDOR } });

    const queryOptions: any = {
      where: {
        owners: {
          user: {
            id: user.id,
            is_deleted: false,
          },
          is_owner: true,
          is_deleted: false,
        },
        is_deleted: false,
      },
      relations: [
        'certificateInfo',
        'owners',
        'qr_code',
        'owners.user',
        'certificateInfo.product_image',
        'certificateInfo.created_by_vendor',
        'certificateInfo.custom_bg',
        'certificateInfo.created_by_vendor.vendorInfo',
        'certificateInfo.created_by_vendor.vendorInfo.attachment',
      ],
    };

    if (name) {
      queryOptions.where.certificateInfo = {
        name: ILike(`%${name}%`),
      };
    }

    const certificates = await this.certificateRepository.find(queryOptions);

    if (certificates.length === 0) {
      throw new NotFoundException('Certificate not found. Please claim your certificate.');
    }
    return certificates.map(transformGetCertificateToDto);
  }

  async scanCertificate(certificateId: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const certificate = await this.certificateRepository.findOne({
        where: { id: certificateId },
        relations: ['owners'],
      });

      if (!certificate) {
        throw new NotFoundException('Certificate not found ');
      }

      const isAlreadyOwner = await this.certificateRepository.findOne({
        where: {
          id: certificateId,
          owners: {
            user: {
              id: user.id,
              is_deleted: false,
            },
            is_owner: true,
            is_deleted: false,
          },
        },
      });

      if (isAlreadyOwner) {
        throw new BadRequestException('You are already owner');
      }

      const currentOwner = certificate.owners.find(owner => owner.is_owner);

      if (currentOwner) {
        currentOwner.is_owner = false;
        await queryRunner.manager.save(CertificateOwner, currentOwner);
      }

      const newOwner = new CertificateOwner();
      newOwner.certificate = certificate;
      newOwner.user = user;
      newOwner.is_owner = true;
      await queryRunner.manager.save(CertificateOwner, newOwner);

      await queryRunner.commitTransaction();
      return { message: 'Ownership transferred successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
