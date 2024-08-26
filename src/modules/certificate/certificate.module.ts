import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { CertificateService } from './service/certificate.service';
import { CertificateInfo } from './entities/certificate-info.entity';
import { CertificateInfoService } from './service/certificate-info.service';
import { CertificateInfoController } from './controller/certificate-info.controller';
import { CertificateController } from './controller/certificate.controller';
import { CertificateOwner } from './entities/certificate-owner.entity';
import { Attachment } from '../attachment/entities/attachment.entity';
import { AttachmentService } from '../attachment/attachment.service';
import { SendToSpaceService } from '../attachment/send-to-space.service';
import { UserService } from 'src/modules/user/user.service';
import { Country } from '../country/entities/country.entity';
import { SubscriptionStatusService } from '../subscription/services/Subscription-status.service';
import { SubscriptionStatus } from '../subscription/entities/subscription-status.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { SubscriptionPlanFeature } from '../subscription/entities/subscription-plan-feature.entity';
import { MailService } from '../common/service/email.service';
import { ReportProblemController } from './controller/report-problem.controller';
import { ReportProblemService } from './service/report-problem.service';
import { ReportProblem } from './entities/report-problem.entity';
import { User } from '../user/entities/user.entity';
import { VendorInfo } from '../user/entities/vendor-info.entity';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from '../user/entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, CertificateInfo, ReportProblem, VendorInfo, UserProfile, CertificateOwner,Country, User, Attachment, SubscriptionPlanFeature, SubscriptionPlan, SubscriptionStatus]),
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
    JwtService
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
    JwtService,
    TypeOrmModule,

  ],
})
export class CertificateModule {}
