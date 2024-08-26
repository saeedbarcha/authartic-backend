import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { CertificateOwner } from '../entities/certificate-owner.entity';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { GetCertificateDto } from '../dto/get-certificate.dto';
import { transformGetCertificateToDto } from 'src/utils/certificate-transform.util';
import * as archiver from 'archiver';
import * as QRCode from 'qrcode';
import { GetAttachmentDto } from 'src/modules/attachment/dto/get-attachment.dto';
import { MailService } from 'src/modules/common/service/email.service';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { AttachmentService } from 'src/modules/attachment/attachment.service';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';

@Injectable()
export class CertificateService {
  private readonly baseUrl: string = process.env.BACKEND_URL || 'http://localhost:5000';

  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(CertificateOwner)
    private readonly mailService:MailService,
    private readonly attachmentService: AttachmentService,
    private readonly dataSource: DataSource,
  ) {}

  async getCertificates(name: string | null, user: User): Promise<GetCertificateDto[]> {
    const isVendor = await this.userRepository.findOne({ where: { id: user.id, role: UserRoleEnum.USER } });
    if (!isVendor) {
      throw new NotFoundException('Only user can access this data..');
    }
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


  // async duplicateCertificate(
  //   id: number,
  //   user: User,
  //   email: string
  // ): Promise<void> {
  //   // Find the original certificate
  //   const originalCertificate = await this.certificateRepository.findOne({
  //     where: { id: id },
  //     relations: ['certificateInfo'],
  //   });

  //   if (!originalCertificate) {
  //     throw new BadRequestException(`Certificate not found with id ${id}.`);
  //   }

  //   // Duplicate the certificate
  //   const newCertificate = new Certificate();
  //   newCertificate.serial_number = `SN-${Date.now()}`;
  //   newCertificate.certificateInfo = originalCertificate.certificateInfo;

  //   const savedCertificate = await this.certificateRepository.save(newCertificate);

  //   // Generate QR code
  //   const qrCodeDataUrl = await QRCode.toDataURL(`${this.baseUrl}/api/v1/certificate/claim-certificate/${savedCertificate.id}/scan`);
  //   const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(",")[1], 'base64');

  //   const qrCodeFile: Express.Multer.File = {
  //     buffer: qrCodeBuffer,
  //     originalname: 'qrcode.png',
  //     mimetype: 'image/png',
  //     size: qrCodeBuffer.length,
  //     fieldname: 'qr_code',
  //     encoding: '7bit',
  //     stream: Readable.from(qrCodeBuffer),
  //     destination: '',
  //     filename: 'qrcode.png',
  //     path: '',
  //   };

  //   const qrCodeAttachment: GetAttachmentDto = await this.attachmentService.upload(qrCodeFile, 'photo');

  //   const isAttachmentUploaded = await this.attachmentRepository.findOne({
  //     where: {
  //       id: qrCodeAttachment.id,
  //     },
  //   });

  //   savedCertificate.qr_code =isAttachmentUploaded;
  //   // Generate PDF
  //   const pdfBuffer = await this.generatePDFBuffer({
  //     qrCode: qrCodeDataUrl,
  //     id: savedCertificate.id,
  //     name: originalCertificate.certificateInfo.name,
  //     description: originalCertificate.certificateInfo.description
  //   });

  //   // Create ZIP folder
  //   const zipBuffer = await this.createZipBuffer(pdfBuffer);

  //   // Send ZIP via email
  //   try {
  //     await this.mailService.sendCertificateInfoZip(
  //       email,
  //       // 'Duplicated Certificate',
  //       // 'Here is the duplicated certificate you requested.',
  //       zipBuffer
  //     );
  //   } catch (emailError) {
  //     throw new BadRequestException('Failed to send email. Certificate duplication was successful, but email delivery failed.');
  //   }
  // }

  // private async generatePDFBuffer({
  //   qrCode,
  //   id,
  //   name,
  //   description
  // }: {
  //   qrCode: string;
  //   id: number;
  //   name: string;
  //   description: string;
  // }): Promise<Buffer> {
  //   const doc = new PDFDocument();
  //   const buffers: Buffer[] = [];
    
  //   return new Promise((resolve, reject) => {
  //     doc.on('data', buffers.push.bind(buffers));
  //     doc.on('end', () => {
  //       const pdfBuffer = Buffer.concat(buffers);
  //       resolve(pdfBuffer);
  //     });
  //     doc.on('error', reject);

  //     doc.fontSize(20).text(`Name: ${name}`, 100, 50);
  //     doc.fontSize(20).text(`Description: ${description}`, 100, 80);
  //     doc.fontSize(15).text(`ID: ${id}`, 100, 150);
  //     doc.image(qrCode, {
  //       fit: [100, 100],
  //       align: 'center',
  //       valign: 'center'
  //     });
  //     doc.end();
  //   });
  // }

  private async createZipBuffer(pdfBuffer: Buffer): Promise<Buffer> {
    const archive = archiver('zip');
    const buffers: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      archive.on('data', buffers.push.bind(buffers));
      archive.on('end', () => {
        const zipBuffer = Buffer.concat(buffers);
        resolve(zipBuffer);
      });
      archive.on('error', reject);

      archive.append(pdfBuffer, { name: 'certificate.pdf' });
      archive.finalize();
    });
  }

  // async duplicateCertificate(
  //   id: number,
  //   user: User,
  //   @Res() res: Response
  // ): Promise<void> {
  //   if (!id) {
  //     throw new BadRequestException('Certificate ID is required.');
  //   }
  
  //   const isVendor = await this.userRepository.findOne({
  //     where: { id: user.id, role: UserRoleEnum.VENDOR },
  //     relations: [
  //       'subscriptionStatus',
  //       'subscriptionStatus.subscriptionPlan',
  //       'subscriptionStatus.subscriptionPlan.subscriptionPlanFeatures',
  //     ],
  //   });
  
  //   if (!isVendor) {
  //     throw new BadRequestException(`Vendor with ID ${user.id} not found or not authorized.`);
  //   }
  
  //   if (isVendor.subscriptionStatus.is_expired) {
  //     throw new BadRequestException('Your subscription plan has expired. Please upgrade now.');
  //   }
  
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  
  //   try {
  //     // Step 1: Find the original certificate
  //     let originalCertificate = await this.certificateInfoRepository.findOne({
  //       where: {
  //         id: id,
  //         created_by_vendor: { id: isVendor.id },
  //       },
  //       relations: ['created_by_vendor', 'product_image', 'custom_bg'],
  //     });
  
  //     if (!originalCertificate) {
  //       throw new NotFoundException(`Certificate with ID ${id} not found.`);
  //     }
  
  //     // Step 2: Update the status and is_deleted flag of the original certificate
  //     originalCertificate.status = 2;
  //     originalCertificate.is_deleted = false;
  //     await queryRunner.manager.save(originalCertificate);
  
  //     // Step 3: Create a new certificate based on the original
  //     const newCertificate = this.certificateInfoRepository.create({
  //       ...originalCertificate,
  //       id: undefined, // Clear the ID to create a new record
  //       status: 1, // Set the status for the new certificate
  //     });
  
  //     const savedCertificate = await queryRunner.manager.save(newCertificate);
  
  //     // Step 4: Generate a new QR code for the new certificate
  //     const qrCodeDataUrl = await QRCode.toDataURL(
  //       `${this.baseUrl}/api/v1/certificate/claim-certificate/${savedCertificate.id}/scan`
  //     );
  //     const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
  
  //     const qrCodeFile: Express.Multer.File = {
  //       buffer: qrCodeBuffer,
  //       originalname: 'qrcode.png',
  //       mimetype: 'image/png',
  //       size: qrCodeBuffer.length,
  //       fieldname: 'qr_code',
  //       encoding: '7bit',
  //       stream: Readable.from(qrCodeBuffer),
  //       destination: '',
  //       filename: 'qrcode.png',
  //       path: '',
  //     };
  
  //     // Upload the QR code
  //     const qrCodeAttachment = await this.attachmentService.upload(qrCodeFile, 'photo');
  
  //     // Step 5: Associate the QR code with the new certificate
  //     savedCertificate.qr_code = qrCodeAttachment;
  //     await queryRunner.manager.save(savedCertificate);
  
  //     // Step 6: Create a PDF file for the new certificate
  //     const pdfBuffer = await this.generatePDFBuffer(savedCertificate);
  
  //     // Step 7: Create a ZIP file containing the PDF
  //     const zipBuffer = await this.generateZipBuffer([pdfBuffer]);
  
  //     // Step 8: Send the ZIP file to the vendor's email
  //     try {
  //       await this.mailService.sendCertificateInfoZip(user.email, zipBuffer);
  //     } catch (emailError) {
  //       throw new BadRequestException('Failed to send email. Certificate was not created.');
  //     }
  
  //     // Commit the transaction after successful email send
  //     await queryRunner.commitTransaction();
  
  //     res.status(201).json({
  //       message: `Certificate duplicated and sent to ${user.email}`,
  //     });
  //   } catch (error) {
  //     // Rollback transaction if any error occurs
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
  
}
