import { Injectable, ConflictException,GoneException , BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateValidationCodeDto } from './dto/create-validation-code.dto';
import { ValidationCode } from './entities/validation-code.entity';
import { GetValidationCodeDto } from './dto/get-by-code.dto';
import { checkIsAdmin } from 'src/utils/check-is-admin.util';
import { User } from '../user/entities/user.entity';


@Injectable()
export class ValidationCodeService {
  constructor(
    @InjectRepository(ValidationCode)
    private readonly validationCodeRepository: Repository<ValidationCode>,
  ) { }

  // public
  async findByCode(code: string): Promise<GetValidationCodeDto> {
    const validationCode = await this.validationCodeRepository.findOne({ where: { code } });
    if (!validationCode) {
      throw new NotFoundException('Code not found.');
    }
    if (validationCode.is_deleted) {
      throw new GoneException ('Code is deleted.');
    }
    if (validationCode.is_used) {
      throw new NotFoundException('Code is already used.');
    }
    if (validationCode.status !== 1) {
      throw new NotFoundException('Code is not active.');
    }
    return plainToInstance(GetValidationCodeDto, validationCode, { excludeExtraneousValues: true });
  }

  // admin
  async create(createValidationCodeDto: CreateValidationCodeDto, user: User): Promise<GetValidationCodeDto[]> {
    
    checkIsAdmin(user, "Only Admin can create code data.");

    const { no_Validation_code } = createValidationCodeDto;
    this.validateNumberOfCodes(no_Validation_code);

    const startNumber = await this.getStartNumber();

    const validationCodes: ValidationCode[] = [];
    for (let i = startNumber; i < startNumber + no_Validation_code; i++) {
      const code = `VC${this.pad(i, 8)}`;
      await this.checkCodeExists(code);

      const newValidationCode = new ValidationCode();
      newValidationCode.code = code;
      newValidationCode.is_used = false;
      validationCodes.push(newValidationCode);
    }

    const savedValidationCodes = await this.validationCodeRepository.save(validationCodes);
    return plainToInstance(GetValidationCodeDto, savedValidationCodes, { excludeExtraneousValues: true });
  }



  private validateNumberOfCodes(no_Validation_code: number) {
    if (!no_Validation_code || isNaN(no_Validation_code) || no_Validation_code <= 0) {
      throw new BadRequestException('Invalid number of validation codes.');
    }
  }

  private async getStartNumber(): Promise<number> {
    const lastValidationCode = await this.validationCodeRepository.findOne({
      order: { id: 'DESC' },
      where: {},
    });
    if (lastValidationCode) {
      const lastCodeParts = lastValidationCode.code.split('C');
      if (lastCodeParts.length === 2) {
        return parseInt(lastCodeParts[1], 10) + 1;
      }
    }
    return 1;
  }

  private async checkCodeExists(code: string) {
    const validationCodeExists = await this.validationCodeRepository.findOne({ where: { code } });
    if (validationCodeExists) {
      throw new ConflictException(`Validation code already exists.`);
    }
  }

  private pad(num: number, size: number): string {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  async findValidationCodes(
    user: User,
    isUsed?: boolean,
    code?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ isUsed: boolean, totalCount: number; totalPages: number; currentPage: number; data: GetValidationCodeDto[] }> {
    checkIsAdmin(user, "Only Admin access this data.");
    

    const query = this.validationCodeRepository.createQueryBuilder('validation_code')
      .where('validation_code.is_deleted = false')
      .andWhere('validation_code.status = :status', { status: 1 });

    if (isUsed !== undefined) {
      query.andWhere('validation_code.is_used = :isUsed', { isUsed });
    }

    if (code) {
      query.andWhere('LOWER(validation_code.code) LIKE LOWER(:code)', { code: `%${code}%` });
    }

    const totalCount = await query.getCount();

    const validationCodes = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    if (validationCodes.length === 0) {
      throw new NotFoundException('No validation code found.');
    }

    const validationCodeDtos = plainToInstance(GetValidationCodeDto, validationCodes, { excludeExtraneousValues: true });

    return {
      isUsed,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: validationCodeDtos,
    };
  }

  async countValidationCodes(user:User): Promise<{ availableValidationCodes: number; totalValidationCodes: number }> {
    checkIsAdmin(user, "Only Admin can access this data.");
    const totalValidationCodes = await this.validationCodeRepository.count();
    const availableValidationCodes = await this.validationCodeRepository.count({
      where: { status: 1, is_deleted: false, is_used: false },
    });
    return { availableValidationCodes, totalValidationCodes };
  }
}
