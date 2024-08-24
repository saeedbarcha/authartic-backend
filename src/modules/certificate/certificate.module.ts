import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { CertificateService } from './service/certificate.service';
import { CertificateInfo } from './entities/certificate-info.entity';
import { CertificateInfoService } from './service/certificate-info.service';
import { CertificateInfoController } from './controller/certificate-info.controller';
import { CertificateController } from './controller/certificate.controller';
import { CertificateOwner } from './entities/certificate-owner.entity';
import { User } from '../auth/entities/user.entity';
import { Attachment } from '../attachment/entities/attachment.entity';
import { AttachmentService } from '../attachment/attachment.service';
import { SendToSpaceService } from '../attachment/send-to-space.service';
import { UserService } from '../auth/service/user.service';
import { Country } from '../country/entities/country.entity';
import { VendorInfo } from '../auth/entities/vendor-info.entity';
import { SubscriptionStatusService } from '../subscription/services/Subscription-status.service';
import { SubscriptionStatus } from '../subscription/entities/subscription-status.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { SubscriptionPlanFeature } from '../subscription/entities/subscription-plan-feature.entity';
import { MailService } from '../common/service/email.service';
import { ReportProblemController } from './controller/report-problem.controller';
import { ReportProblemService } from './service/report-problem.service';
import { ReportProblem } from './entities/report-problem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, CertificateInfo, ReportProblem, VendorInfo, CertificateOwner,Country, User, Attachment, SubscriptionPlanFeature, SubscriptionPlan, SubscriptionStatus]),
  ],
  controllers: [CertificateInfoController, CertificateController, ReportProblemController],
  providers: [
    CertificateService,
    CertificateInfoService,
    ReportProblemService,
    AttachmentService,
    SendToSpaceService,
    SubscriptionStatusService,
    UserService ,
    MailService,
  ],
  exports: [
    CertificateService,
    CertificateInfoService,
    ReportProblemService,
    AttachmentService,
    SendToSpaceService,
    SubscriptionStatusService,
    UserService ,
    MailService,
    TypeOrmModule,
  ],
})
export class CertificateModule {}
