import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { CertificateInfo } from 'src/modules/certificate/entities/certificate-info.entity';
import { ReportProblem } from '../entities/report-problem.entity';
import { CreateReportProblemDto } from '../dto/create-report-problem.dto';
import { RespondReportProblemDto } from '../dto/respond-report-problem.dto';
import { ReportProblemStatusEnum } from 'src/modules/common/report-problem-status.enum';
import { MailService } from 'src/modules/common/service/email.service';
import { checkIsAdmin } from 'src/utils/check-is-admin.util';
import { GetReportProblemDto } from '../dto/get-report-problem.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ReportProblemService {

    private readonly logger = new Logger(ReportProblemService.name);

    constructor(
        @InjectRepository(ReportProblem)
        private readonly reportProblemRepository: Repository<ReportProblem>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(CertificateInfo)
        private readonly certificateInfoRepository: Repository<CertificateInfo>,
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly connection: Connection
    ) { }

    async createReport(id: number, createReportProblemDto: CreateReportProblemDto, user: User): Promise<GetReportProblemDto> {
      
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { reporting_text } = createReportProblemDto;

            const vendor = await this.userRepository.findOne({ where: { id: user.id } });
            if (!vendor) {
                throw new NotFoundException(`Vendor with ID ${user.id} not found`);
            }

            const certificateInfo = await this.certificateInfoRepository.findOne({ where: { id } });
            if (!certificateInfo) {
                throw new NotFoundException(`CertificateInfo with ID ${id} not found`);
            }

            const reportProblem = this.reportProblemRepository.create({
                vendor,
                certificate_info: certificateInfo,
                reporting_text,
                reporting_date: new Date(),
                report_status: ReportProblemStatusEnum.OPEN,
            });

            const savedReport = await queryRunner.manager.save(reportProblem);

            try {
                await this.mailService.sendReportEmail(savedReport.id, id, savedReport.reporting_text, vendor.email);
            } catch (emailError) {
                throw new BadRequestException('Failed to send email. Report was not created.');
            }
            await queryRunner.commitTransaction();

            // Transform the saved report before returning
            const transformedReport = this.transformReportData([savedReport])[0];
            return transformedReport;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async respondToReport(id: number, respondReportProblemDto: RespondReportProblemDto, user: User): Promise<GetReportProblemDto> {
        
        checkIsAdmin(user, 'Only Admin can verify vendors.')
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const reportProblem = await this.getReportProblemById(id);
           
            if (!reportProblem) {
                throw new NotFoundException(`Report not found`);
            }

            const certificateInfo = await this.certificateInfoRepository.findOne({ where: { id: reportProblem.certificate_info.id } });
            if (!certificateInfo) {
                throw new NotFoundException(`Certificate not found`);
            }
            reportProblem.response_text = respondReportProblemDto.response_text;
            reportProblem.response_date = new Date();
            reportProblem.admin = user;
            reportProblem.report_status = respondReportProblemDto.report_status;

            const updatedReport = await queryRunner.manager.save(reportProblem);
          

            try {
                const vendorDetails = await this.userService.findUserById(reportProblem.vendor.id);

                await this.mailService.sendReportResponseEmail(updatedReport.id, certificateInfo.id, updatedReport.response_text, updatedReport.report_status, vendorDetails);
            } catch (emailError) {
                this.logger.error(`Failed to send email: ${emailError.message}`, emailError.stack);
                throw new BadRequestException('Failed to send email. Report response was not saved.');
            }

            await queryRunner.commitTransaction();

            const transformedReport = this.transformReportData([updatedReport])[0];
            return transformedReport;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to respond to report: ${error.message}`, error.stack);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getReportProblemById(id: number): Promise<ReportProblem> {
        const reportProblem = await this.reportProblemRepository.findOne({
            where: { id },
            relations: [
                'vendor',
                'admin',
                'certificate_info',
            ],
        });

        if (!reportProblem) {
            throw new NotFoundException(`Report with ID ${id} not found`);
        }

        return reportProblem;
    }

    private transformReportData(data: ReportProblem[]): GetReportProblemDto[] {
        return data.map(report => ({
          id: report.id,
          reporting_date: report.reporting_date.toISOString(),
          reporting_text: report.reporting_text,
          response_date: report.response_date?.toISOString() ?? null,
          response_text: report.response_text,
          report_status: report.report_status,
          vendor: {
            id: report.vendor.id,
            user_name: report.vendor.user_name,
            email: report.vendor.email,
            role: report.vendor.role,
            is_verified_email: report.vendor.vendorInfo.is_verified_email,
          },
          certificate_info: {
            id: report.certificate_info.id,
            name: report.certificate_info.name,
            description: report.certificate_info.description,
            font: report.certificate_info.font,
            font_color: report.certificate_info.font_color,
            bg_color: report.certificate_info.bg_color,
            issued: report.certificate_info.issued,
            issued_date: report.certificate_info.issued_date.toISOString(),
            product_sell: report.certificate_info.product_sell,
            saved_draft: report.certificate_info.saved_draft,
          },
        }));
    }

    async getReports(
        user: User,
        page: number = 1,
        limit: number = 10,
        vendorName?: string,
        reportId?: number,
        status?: number
      ): Promise<{
        count: number;
        pages: number;
        limit: number;
        currentPage: number;
        status: number;
        vendor_name?: string;
        report_id?: number;
        data: GetReportProblemDto[];
      }> {
        checkIsAdmin(user, 'Only Admin can verify vendors.');
    
        const queryBuilder = this.reportProblemRepository.createQueryBuilder('report')
          .leftJoinAndSelect('report.vendor', 'vendor')
          .leftJoinAndSelect('report.certificate_info', 'certificate_info')
          .where('report.is_deleted = :isDeleted', { isDeleted: false })
          .skip((page - 1) * limit)
          .take(limit);
    
        if (vendorName) {
          queryBuilder.andWhere('vendor.user_name LIKE :vendorName', { vendorName: `%${vendorName}%` });
        }
        if (reportId) {
          queryBuilder.andWhere('report.id = :reportId', { reportId });
        }
        if (status) {
          queryBuilder.andWhere('report.report_status = :status', { status });
        }
    
        const [data, count] = await queryBuilder.getManyAndCount();
        const pages = Math.ceil(count / limit);
        const currentPage = page;
    
        const transformedData = this.transformReportData(data);
    
        return {
          count,
          pages,
          limit,
          currentPage,
          status,
          vendor_name: vendorName,
          report_id: reportId,
          data: transformedData,
        };
      }
}
