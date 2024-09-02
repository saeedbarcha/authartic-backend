import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { Country } from '../country/entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CountryService } from '../country/country.service';
import { ValidationCode } from '../validation-code/entities/validation-code.entity';
import { ValidationCodeService } from '../validation-code/validation-code.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Font } from '../font/entities/font.entity';
import { FontService } from '../font/font.service';
import { MailService } from '../common/service/email.service';
import { ReportProblem } from '../certificate/entities/report-problem.entity';
import { ReportProblemService } from '../certificate/service/report-problem.service';
import { CertificateInfo } from '../certificate/entities/certificate-info.entity';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { VendorInfo } from '../user/entities/vendor-info.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, VendorInfo, Country, ValidationCode, Font, CertificateInfo, ReportProblem]), AuthModule],
  providers: [AuthService, JwtService, FontService, CountryService, ValidationCodeService, ReportProblemService, MailService],
  controllers: [AdminController],
  exports: [AuthService, JwtService, FontService, CountryService, ValidationCodeService, ReportProblemService, MailService, TypeOrmModule]


})
export class AdminModule { }

