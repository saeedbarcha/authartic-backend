// src/seeds/validation-code.seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationCode } from 'src/modules/validation-code/entities/validation-code.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ValidationCodeSeederService {
  constructor(
    @InjectRepository(ValidationCode)
    private readonly validationCodeRepository: Repository<ValidationCode>,
  ) {}

  async seed() {
    await this.seedValidationCodes();
    console.log('Seeding validation codes completed');
  }

  private async seedValidationCodes() {
    const validationCodes = Array.from({ length: 40 }, (_, i) => ({
      code: `VC${(i + 1).toString().padStart(8, '0')}`,
      is_used: false,
    }));

    for (const codeData of validationCodes) {
      const existingCode = await this.validationCodeRepository.findOne({ where: { code: codeData.code } });
      if (!existingCode) {
        const code = this.validationCodeRepository.create(codeData);
        await this.validationCodeRepository.save(code);
      }
    }
  }
}
