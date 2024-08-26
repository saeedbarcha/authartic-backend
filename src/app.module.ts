import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { typeOrmConfig } from './configs/typeorm.config';
import { UserSeederService } from './seeds/user.seeder.service';
import { ValidationCodeModule } from './modules/validation-code/validation-code.module';
import { CountryModule } from './modules/country/country.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './modules/common/error-filters/http-exception.filter';
import { SubscriptionPlanModule } from './modules/subscription/subscription.module';
import { AdminModule } from './modules/admin/admin.module';
import { FontModule } from './modules/font/font.module';
import { ContactModule } from './modules/contact/contact.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync(typeOrmConfig),
    ScheduleModule.forRoot(),
    AttachmentModule,
    CountryModule,
    ContactModule,
    ValidationCodeModule,
    CertificateModule,
    SubscriptionPlanModule,
    AdminModule,
    FontModule,

  ],
  controllers: [AppController],
  providers: [AppService, UserSeederService, 
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ]
})
export class AppModule { }
