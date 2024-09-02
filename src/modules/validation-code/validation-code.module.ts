import { Module } from '@nestjs/common';
import { ValidationCodeService } from './validation-code.service';
import { ValidationCodeController } from './validation-code.controller';
import { ValidationCode } from './entities/validation-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ValidationCodeSeederService } from 'src/seeds/validation-code.seeder.service';


@Module({
  imports: [TypeOrmModule.forFeature([ValidationCode]), AuthModule],
  providers: [ValidationCodeService, ValidationCodeSeederService],
  controllers: [ValidationCodeController],
  exports: [ValidationCodeService, ValidationCodeSeederService, TypeOrmModule]

})

export class ValidationCodeModule {}



