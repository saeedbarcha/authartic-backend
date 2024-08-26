import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlanFeature } from './entities/subscription-plan-feature.entity';
import { SubscriptionPlanSeederService } from 'src/seeds/subscription-plan.seeder.service';
import { UserService } from 'src/modules/user/user.service';
import { Country } from '../country/entities/country.entity';
import { SubscriptionStatus } from './entities/subscription-status.entity';
import { CertificateModule } from '../certificate/certificate.module';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionStatusService } from './services/Subscription-status.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionController } from './controller/subscription.controller';
import { User } from '../user/entities/user.entity';
import { VendorInfo } from '../user/entities/vendor-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan,SubscriptionStatus, SubscriptionPlanFeature, VendorInfo, User, Country]),
  CertificateModule,
  AuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionPlanService, SubscriptionPlanSeederService,SubscriptionStatusService, UserService],
  exports: [SubscriptionPlanService, SubscriptionPlanSeederService,SubscriptionStatusService, UserService],
})
export class SubscriptionPlanModule { }
