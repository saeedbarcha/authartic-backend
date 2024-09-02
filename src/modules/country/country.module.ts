import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Country } from './entities/country.entity';
import { CountrySeederService } from 'src/seeds/country.seeder.service';


@Module({
  imports: [TypeOrmModule.forFeature([Country]), AuthModule],
  providers: [CountryService, CountrySeederService],
  controllers: [CountryController],
  exports: [CountryService, CountrySeederService, TypeOrmModule]

})

export class CountryModule {}

