import { Module } from '@nestjs/common';
import { FontService } from './font.service';
import { FontController } from './font.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Font } from './entities/font.entity';
import { FontSeederService } from 'src/seeds/fonts.seeder.service';


@Module({
  imports: [TypeOrmModule.forFeature([Font]), AuthModule],
  controllers: [FontController],
  providers: [FontService, FontSeederService, TypeOrmModule],

})

export class FontModule { }

