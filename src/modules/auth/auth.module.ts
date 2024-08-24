// auth.module.ts

import { Module } from '@nestjs/common';
import { LocalStrategy } from './jwt-strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './jwt-strategy/jwt.strategy';
import { AuthService } from './service/auth.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { VendorInfo } from './entities/vendor-info.entity';
import { Attachment } from '../attachment/entities/attachment.entity';
import { Country } from '../country/entities/country.entity';
import { ValidationCode } from '../validation-code/entities/validation-code.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { UserSeederService } from 'src/seeds/user.seeder.service';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { SubscriptionStatus } from '../subscription/entities/subscription-status.entity';
import { SubscriptionPlanFeature } from '../subscription/entities/subscription-plan-feature.entity';
import { SubscriptionPlanService } from '../subscription/services/subscription-plan.service';
import { MailService } from '../common/service/email.service';




@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, VendorInfo, Attachment, Country, ValidationCode,  SubscriptionPlan, SubscriptionStatus, SubscriptionPlanFeature]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'Keyy', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService, UserSeederService, LocalStrategy, JwtStrategy, SubscriptionPlanService, MailService],
  exports: [AuthService, UserService, UserSeederService, JwtStrategy, SubscriptionPlanService, MailService],
})
export class AuthModule { }
