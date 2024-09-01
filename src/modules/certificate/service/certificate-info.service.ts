import * as archiver from 'archiver';
import * as QRCode from 'qrcode';
import e, { Response } from 'express';
import { Injectable, NotFoundException, Res, Body, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, DataSource } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Certificate } from '../entities/certificate.entity';
import { CertificateInfo } from '../entities/certificate-info.entity';
import { CreateCertificateInfoDto } from '../dto/create-certificate-info.dto';
import { CertificateOwner } from '../entities/certificate-owner.entity';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { AttachmentService } from 'src/modules/attachment/attachment.service';
import { GetCertificateInfoDto } from '../dto/get-certificate-info.dto';
import { transformGetCertificateInfoToDto } from 'src/utils/certificate-transform.util';
import { UpdateSubscriptionStatusDto } from 'src/modules/subscription/dto/update-subscription-status.dto';
import { CreateSubscriptionStatusDto } from 'src/modules/subscription/dto/create-subscription-status.dto';
import { SubscriptionStatusService } from 'src/modules/subscription/services/Subscription-status.service';
import { MailService } from 'src/modules/common/service/email.service';


@Injectable()
export class CertificateInfoService {
  private readonly baseUrl: string = process.env.BACKEND_URL || 'http://localhost:5000';
  constructor(
    @InjectRepository(CertificateInfo)
    private readonly certificateInfoRepository: Repository<CertificateInfo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly dataSource: DataSource,
    private readonly attachmentService: AttachmentService,
    private readonly subscriptionStatusService: SubscriptionStatusService,
    private readonly mailService: MailService,

  ) { }


  async create(createCertificateInfoDto: CreateCertificateInfoDto, user: User, res: Response): Promise<CertificateInfo> {
    if (user.role !== UserRoleEnum.VENDOR) {
      throw new BadRequestException('Only VENDOR can create certificate ID');
    }

    const isVendor = await this.userRepository.findOne({
      where: { id: user.id },
      relations: [
        'userProfile',
        'vendorInfo',
        'country',
        'vendorInfo.validationCode',
        'subscriptionStatus',
        'subscriptionStatus.subscriptionPlan',
        'subscriptionStatus.subscriptionPlan.subscriptionPlanFeatures',
      ],
    });

    if (!isVendor.vendorInfo.validationCode) {
      throw new BadRequestException('Your Account is not verified yet');
    }

    if (!isVendor.subscriptionStatus) {
      throw new BadRequestException(`You don't have any active plan`);
    }

    if (isVendor.subscriptionStatus.is_expired) {
      throw new BadRequestException('Your subscription plan has expired. Please upgrade now.');
    }

    if (isVendor.subscriptionStatus.remaining_certificates < createCertificateInfoDto.number_of_certificate) {
      throw new BadRequestException(`You have only ${isVendor.subscriptionStatus.remaining_certificates} certificate${isVendor.subscriptionStatus.remaining_certificates === 1 ? '' : 's'}.`);
    }

    if (!createCertificateInfoDto.name) {
      throw new BadRequestException('Name is required');
    }
    if (!createCertificateInfoDto.product_image_id) {
      throw new BadRequestException('Product image is required');
    }
    if (!createCertificateInfoDto.saved_draft && createCertificateInfoDto.number_of_certificate <= 0) {
      throw new BadRequestException('Number of certificate must be greater than 1');
    }
    if (!createCertificateInfoDto.description) {
      throw new BadRequestException('Description is required');
    }
    if (!createCertificateInfoDto.font) {
      throw new BadRequestException('Font is required');
    }
    if (!createCertificateInfoDto.font_color) {
      throw new BadRequestException('Font color is required');
    }
    if (!createCertificateInfoDto.bg_color) {
      throw new BadRequestException('Background color is required');
    }
    if (!createCertificateInfoDto.product_sell) {
      throw new BadRequestException('Product primarily sell is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();

    // Connect and start a transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productImage = await this.attachmentRepository.findOne({ where: { id: createCertificateInfoDto.product_image_id } });

      if (!productImage) {
        throw new BadRequestException('Product image is not found');
      }

      const newCertificateInfo = new CertificateInfo();
      newCertificateInfo.name = createCertificateInfoDto.name;
      newCertificateInfo.description = createCertificateInfoDto.description;
      newCertificateInfo.font = createCertificateInfoDto.font;
      newCertificateInfo.font_color = createCertificateInfoDto.font_color;
      newCertificateInfo.bg_color = createCertificateInfoDto.bg_color;
      newCertificateInfo.issued_date = new Date();
      newCertificateInfo.product_sell = createCertificateInfoDto.product_sell;
      newCertificateInfo.saved_draft = createCertificateInfoDto.saved_draft;
      newCertificateInfo.created_by_vendor = user;
      newCertificateInfo.product_image = productImage;

      if (createCertificateInfoDto.saved_draft) {
        newCertificateInfo.issued = 0;
        newCertificateInfo.issued_date = null;
      } else {
        newCertificateInfo.issued = createCertificateInfoDto.number_of_certificate;
      }

      if (createCertificateInfoDto.custom_bg) {
        const customBg = await this.attachmentRepository.findOne({ where: { id: createCertificateInfoDto.custom_bg } });

        if (!customBg) {
          throw new BadRequestException('Background image not found');
        }
        newCertificateInfo.custom_bg = customBg;
      }

      // Save new certificate info
      await queryRunner.manager.save(newCertificateInfo);

      // Process QR codes and certificates
      const qrCodes = [];
      const svgBuffers: Buffer[] = [];
      for (let i = 0; i < createCertificateInfoDto.number_of_certificate; i++) {
        const newCertificate = new Certificate();
        newCertificate.serial_number = `SN-${i + 1}-${Date.now()}`;
        newCertificate.certificateInfo = newCertificateInfo;

        const savedCertificate = await queryRunner.manager.save(newCertificate);

        const qrCodeDataUrl = `${this.baseUrl}/api/v1/certificate/claim-certificate/${savedCertificate.id}/scan`;

        newCertificate.qr_code = qrCodeDataUrl;

        await queryRunner.manager.save(newCertificate);

        const newCertificateOwner = new CertificateOwner();
        newCertificateOwner.certificate = savedCertificate;
        newCertificateOwner.is_owner = true;
        newCertificateOwner.user = user;

        await queryRunner.manager.save(newCertificateOwner);

        qrCodes.push({ qrCode: qrCodeDataUrl, id: newCertificate.id });
      }

      const subscriptionStatus = isVendor.subscriptionStatus;
      const createSubscriptionStatusDto = new CreateSubscriptionStatusDto();
      createSubscriptionStatusDto.total_certificates_issued = subscriptionStatus.total_certificates_issued + createCertificateInfoDto.number_of_certificate;
      createSubscriptionStatusDto.remaining_certificates = subscriptionStatus.remaining_certificates - createCertificateInfoDto.number_of_certificate;

      svgBuffers.push(...await this.generateSVGBuffers(qrCodes, createCertificateInfoDto.name, createCertificateInfoDto.description));
      const zipBuffer = await this.generateZipBuffer(svgBuffers);

      try {
        await this.mailService.sendCertificateInfoZip(user.email, zipBuffer);
      } catch (emailError) {
        throw new BadRequestException('Failed to send email. Certificates were not created.');
      }

      await this.subscriptionStatusService.updateSubscriptionStatus(subscriptionStatus.id, createCertificateInfoDto.number_of_certificate, createSubscriptionStatusDto);

      await queryRunner.commitTransaction();

      res.status(201).json({
        message: `Certificates created and sent to ${user.email}`,
      });

      return newCertificateInfo;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateSVGBuffers(qrCodes: { qrCode: string, id: number }[], name: string, description: string): Promise<Buffer[]> {
    const svgBuffers: Buffer[] = [];
    for (const qrCodeData of qrCodes) {
      const qrCodeImageUrl = await QRCode.toDataURL(qrCodeData.qrCode);
      const svgContent = `
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="white"/>
          <text x="20" y="40" font-family="Arial" font-size="24" fill="black">Name: ${name}</text>
          <text x="20" y="80" font-family="Arial" font-size="24" fill="black">Description: ${description}</text>
          <text x="20" y="120" font-family="Arial" font-size="20" fill="black">ID: ${qrCodeData.id}</text>
          <image x="20" y="160" width="200" height="200" href="${qrCodeImageUrl}" />
        </svg>
      `;
      svgBuffers.push(Buffer.from(svgContent));
    }
    return svgBuffers;
  }

  private async generateZipBuffer(svgBuffers: Buffer[]): Promise<Buffer> {
    const archive = archiver('zip');
    const zipBuffers: Buffer[] = [];
    archive.on('data', zipBuffers.push.bind(zipBuffers));

    svgBuffers.forEach((pdfBuffer, index) => {
      archive.append(pdfBuffer, { name: `certificate${index + 1}.svg` });
    });
    archive.finalize();

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (archive.pointer() > 0) {
          clearInterval(interval);
          const zipBuffer = Buffer.concat(zipBuffers);
          resolve(zipBuffer);
        }
      }, 100);
    });
  }

  async reIssueCertificate(
    id: number,
    number_of_certificate: number,
    user: User,
    @Res() res: Response
  ): Promise<void> {
    if (!id) {
      throw new BadRequestException('Certificate ID is required.');
    }

    const isVendor = await this.userRepository.findOne({
      where: { id: user.id, role: UserRoleEnum.VENDOR },
      relations: [
        'subscriptionStatus',
        'subscriptionStatus.subscriptionPlan',
        'subscriptionStatus.subscriptionPlan.subscriptionPlanFeatures',
      ],
    });

    if (!isVendor) {
      throw new BadRequestException(`Vendor with ID ${user.id} not found or not authorized.`);
    }

    if (isVendor.subscriptionStatus.is_expired) {
      throw new BadRequestException('Your subscription plan has expired. Please upgrade now.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let certificateInfo = await this.certificateInfoRepository.findOne({
        where: {
          id: id,
          created_by_vendor: { id: isVendor.id },
        },
        relations: ['created_by_vendor', 'product_image', 'custom_bg'],
      });

      if (!certificateInfo) {
        throw new NotFoundException(`Certificate with ID ${id} not found.`);
      }

      const qrCodes = [];
      const svgBuffers: Buffer[] = [];

      for (let i = 0; i < number_of_certificate; i++) {
        const newCertificate = new Certificate();
        newCertificate.serial_number = `SN-${i + 1}-${Date.now()}`;
        newCertificate.certificateInfo = certificateInfo;

        const savedCertificate = await queryRunner.manager.save(newCertificate);

        const qrCodeDataUrl = `${this.baseUrl}/api/v1/certificate/claim-certificate/${savedCertificate.id}/scan`;

        newCertificate.qr_code = qrCodeDataUrl;

        await queryRunner.manager.save(newCertificate);

        const newCertificateOwner = new CertificateOwner();
        newCertificateOwner.certificate = savedCertificate;
        newCertificateOwner.is_owner = true;
        newCertificateOwner.user = user;

        await queryRunner.manager.save(newCertificateOwner);

        qrCodes.push({ qrCode: qrCodeDataUrl, id: newCertificate.id });
      }

      certificateInfo.saved_draft = false;
      certificateInfo.issued += number_of_certificate;

      await queryRunner.manager.save(certificateInfo);

      const subscriptionStatus = isVendor.subscriptionStatus;
      const updateSubscriptionStatusDto = new UpdateSubscriptionStatusDto();
      updateSubscriptionStatusDto.total_certificates_issued = subscriptionStatus.total_certificates_issued + number_of_certificate;
      updateSubscriptionStatusDto.remaining_certificates = subscriptionStatus.remaining_certificates - number_of_certificate;

      await this.subscriptionStatusService.updateSubscriptionStatus(subscriptionStatus.id, number_of_certificate, updateSubscriptionStatusDto);

      // Generate PDF buffers and ZIP
      svgBuffers.push(...await this.generateSVGBuffers(qrCodes, certificateInfo.name, certificateInfo.description));
      const zipBuffer = await this.generateZipBuffer(svgBuffers);

      // Send email
      try {
        await this.mailService.sendCertificateInfoZip(user.email, zipBuffer);
      } catch (emailError) {
        throw new BadRequestException('Failed to send email. Certificates were not created.');
      }

      // Commit transaction after successful email send
      await queryRunner.commitTransaction();
      res.status(201).json({
        message: `Certificates re-issued for existing and sent to ${user.email}`,
      });

    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async reIssueExistingCertificate(
    id: number,
    certificate_id: number,
    user: User,
    res: Response
  ): Promise<void> {
    if (!id || !certificate_id) {
      throw new BadRequestException('Certificate ID is required.');
    }

    const isVendor = await this.userRepository.findOne({
      where: { id: user.id, role: UserRoleEnum.VENDOR },
      relations: [
        'subscriptionStatus',
        'subscriptionStatus.subscriptionPlan',
        'subscriptionStatus.subscriptionPlan.subscriptionPlanFeatures',
      ],
    });

    if (!isVendor) {
      throw new BadRequestException(`Vendor with ID ${user.id} not found or not authorized.`);
    }

    if (isVendor.subscriptionStatus.is_expired) {
      throw new BadRequestException('Your subscription plan has expired. Please upgrade now.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch the existing certificate to be replaced
      let existingCertificate = await this.certificateRepository.findOne({
        where: {
          id: certificate_id,
          certificateInfo: { id: id, created_by_vendor: { id: isVendor.id } },
        },
        relations: ['certificateInfo'],
      });

      if (!existingCertificate) {
        throw new NotFoundException(`Certificate with ID ${certificate_id} not found.`);
      }
      if (existingCertificate.is_deleted && existingCertificate.status == 2) {
        throw new NotFoundException(`Already re issued certificate for this certificate with ID ${certificate_id}.`);
      }
      existingCertificate.status = 2;
      existingCertificate.is_deleted = true;

      await queryRunner.manager.save(existingCertificate);

      const newCertificate = new Certificate();
      const uniqueIncrement = (await this.certificateRepository.count()) + 1;
      const formattedIncrement = uniqueIncrement.toString().padStart(2, '0');

      newCertificate.serial_number = `SN-${formattedIncrement}-${Date.now().toString().slice(-10)}`;

      newCertificate.certificateInfo = existingCertificate.certificateInfo;

      const savedCertificate = await queryRunner.manager.save(newCertificate);

      const qrCodeDataUrl = `${this.baseUrl}/api/v1/certificate/claim-certificate/${savedCertificate.id}/scan`;
      savedCertificate.qr_code = qrCodeDataUrl;

      await queryRunner.manager.save(savedCertificate);

      const newCertificateOwner = new CertificateOwner();
      newCertificateOwner.certificate = savedCertificate;
      newCertificateOwner.is_owner = true;
      newCertificateOwner.user = user;

      await queryRunner.manager.save(newCertificateOwner);

      // Update certificate info to reflect the issuance of a new certificate
      const certificateInfo = existingCertificate.certificateInfo;
      certificateInfo.saved_draft = false;
      certificateInfo.issued += 1;

      await queryRunner.manager.save(certificateInfo);

      // Update the vendor's subscription status
      const subscriptionStatus = isVendor.subscriptionStatus;
      const updateSubscriptionStatusDto = new UpdateSubscriptionStatusDto();
      updateSubscriptionStatusDto.total_certificates_issued = subscriptionStatus.total_certificates_issued + 1;
      updateSubscriptionStatusDto.remaining_certificates = subscriptionStatus.remaining_certificates - 1;

      await this.subscriptionStatusService.updateSubscriptionStatus(subscriptionStatus.id, 1, updateSubscriptionStatusDto);

      // Generate PDF buffer and ZIP file
      const svgBuffers = await this.generateSVGBuffers([{ qrCode: qrCodeDataUrl, id: savedCertificate.id }], certificateInfo.name, certificateInfo.description);
      const zipBuffer = await this.generateZipBuffer(svgBuffers);

      // Send the ZIP file via email
      try {
        await this.mailService.sendCertificateInfoZip(user.email, zipBuffer);
      } catch (emailError) {
        throw new BadRequestException('Failed to send email. Certificates were not created.');
      }

      // Commit the transaction
      await queryRunner.commitTransaction();
      res.status(201).json({
        message: `Certificate reissued and sent to ${user.email}`,
      });

    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async getAllCertificateInfo(
    name: string | null,
    saved_draft: boolean | false,
    page: number = 1,
    limit: number = 8,

    user: User
  ): Promise<{ data: GetCertificateInfoDto[], total: number, pages: number }> {

    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0.');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0.');
    }

    const isVendor = await this.userRepository.findOne({
      where: { id: user.id, role: UserRoleEnum.VENDOR },
    });

    if (!isVendor) {
      throw new BadRequestException(`Vendor with ID ${user.id} not found or not authorized.`);
    }

    const queryOptions: any = {
      where: {
        created_by_vendor: {
          id: isVendor.id,
        },
        saved_draft: saved_draft ? saved_draft : false
      },
      relations: ['created_by_vendor', 'product_image', 'custom_bg'],
      skip: (page - 1) * limit,
      take: limit,
    };

    if (name) {
      queryOptions.where.name = ILike(`%${name}%`);
    }

    const [certificateInfo, total] = await this.certificateInfoRepository.findAndCount(queryOptions);

    if (certificateInfo.length === 0) {
      throw new NotFoundException('No certificate records available.');
    }


    const totalPages = Math.ceil(total / limit);

    return {
      total,
      pages: totalPages,
      data: certificateInfo.map(transformGetCertificateInfoToDto),
    };
  }

  async getCertificateInfoById(
    id: number,
    saved_draft: boolean | false,
    user: User
  ): Promise<GetCertificateInfoDto> {

    if (!id) {
      throw new BadRequestException('Certificate ID is required.');
    }

    const isVendor = await this.userRepository.findOne({
      where: { id: user.id, role: UserRoleEnum.VENDOR },
    });

    if (!isVendor) {
      throw new BadRequestException(`Vendor with ID ${user.id} not found or not authorized.`);
    }

    const certificate = await this.certificateInfoRepository.findOne({
      where: {
        id: id,
        created_by_vendor: {
          id: isVendor.id,
        },
        saved_draft: saved_draft ? saved_draft : false,

      },
      relations: ['created_by_vendor', 'product_image', 'custom_bg'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate not found.`);
    }

    return transformGetCertificateInfoToDto(certificate);
  }

}

