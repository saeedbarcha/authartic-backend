// auth.module.ts

import { Module,forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { VendorInfo } from './entities/vendor-info.entity';
import { Attachment } from '../attachment/entities/attachment.entity';
import { Country } from '../country/entities/country.entity';
import { ValidationCode } from '../validation-code/entities/validation-code.entity';
import { UserSeederService } from 'src/seeds/user.seeder.service';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { SubscriptionStatus } from '../subscription/entities/subscription-status.entity';
import { SubscriptionPlanFeature } from '../subscription/entities/subscription-plan-feature.entity';
import { SubscriptionPlanService } from '../subscription/services/subscription-plan.service';
import { MailService } from '../common/service/email.service';
import { LocalStrategy } from '../auth/jwt-strategy/local.strategy';
import { JwtStrategy } from '../auth/jwt-strategy/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, VendorInfo, Attachment, Country, ValidationCode,  SubscriptionPlan, SubscriptionStatus, SubscriptionPlanFeature]),
    forwardRef(() => AuthModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Keyy', 
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [ UserController],
  providers: [ UserService, UserSeederService, LocalStrategy, JwtStrategy, SubscriptionPlanService, MailService],
  exports: [ UserService, UserSeederService, JwtStrategy, SubscriptionPlanService, MailService],
})
export class UserModule { }
