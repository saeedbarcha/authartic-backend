import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCountryDto } from './dto/create-country.dto';
import { Country } from './entities/country.entity';
import { UpdateCountryDto } from './dto/update-country.dto';
import { GetCountryDto } from './dto/get-country.dto';
import { plainToInstance } from 'class-transformer';
import { checkIsAdmin } from 'src/utils/check-is-admin.util';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) { }

  // public 
  async findActiveCountries(): Promise<GetCountryDto[]> {
    const activeCountries = await this.countryRepository.find({
      where: { status: 1, is_deleted: false },
    });

    if (activeCountries.length === 0) {
      throw new NotFoundException('No active country found.');
    }

    return plainToInstance(GetCountryDto, activeCountries, { excludeExtraneousValues: true });
  }

  async findOne(id: number): Promise<GetCountryDto> {
    if (!id) {
      throw new NotFoundException('Country ID is required.');
    }

    const country = await this.countryRepository.findOne({
      where: { id },
    });

    if (!country) {
      throw new NotFoundException('Country not found.');
    }

    return plainToInstance(GetCountryDto, country, { excludeExtraneousValues: true });
  }

  // admin 
  async create(createCountryDto: CreateCountryDto, user: User): Promise<GetCountryDto> {
    checkIsAdmin(user, "Only Admin can perform this action.");

    const newCountryName = createCountryDto.name.toLowerCase();

    const existingCountry = await this.countryRepository.findOne({
      where: [{ name: newCountryName }, { code: createCountryDto.code }],
      select: ['name', 'code'],
    });

    if (existingCountry) {
      if (existingCountry.name === newCountryName) {
        throw new ConflictException('Country name already exists.');
      }
      if (existingCountry.code === createCountryDto.code) {
        throw new ConflictException('Country code already exists.');
      }
    }

    const newCountry = this.countryRepository.create({
      ...createCountryDto,
      name: newCountryName,
    });

    const savedCountry = await this.countryRepository.save(newCountry);
    return plainToInstance(GetCountryDto, savedCountry, { excludeExtraneousValues: true });
  }

  async findCountries(
    user: User,
    isActive: boolean,
    name?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ isActive: boolean, totalCount: number; totalPages: number; currentPage: number; data: GetCountryDto[] }> {

    checkIsAdmin(user, "Only Admin can access this data.");


    const query = this.countryRepository.createQueryBuilder('country')
      .where('country.is_deleted = false');

    if (isActive) {
      query.andWhere('country.status = :status', { status: 1 });
    } else {
      query.andWhere('country.status = :status', { status: 2 });
    }

    if (name) {
      query.andWhere('LOWER(country.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    const totalCount = await query.getCount();

    const countries = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    if (countries.length === 0) {
      throw new NotFoundException('No countries found.');
    }

    const countryDtos = plainToInstance(GetCountryDto, countries, { excludeExtraneousValues: true });

    return {
      isActive,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: countryDtos,
    };
  }

  async updateCountry(id: number, updateCountryDto: UpdateCountryDto, user: User): Promise<GetCountryDto> {
    checkIsAdmin(user, "Only Admin can perform this action.");

    const existingCountry = await this.findOne(id);
    if (!existingCountry) {
      throw new NotFoundException('Country not found.');
    }

    const updatedCountryName = updateCountryDto.name.toLowerCase();
    await this.countryRepository.update(id, { ...updateCountryDto, name: updatedCountryName });

    const updatedCountry = await this.findOne(id);
    return plainToInstance(GetCountryDto, updatedCountry, { excludeExtraneousValues: true });
  }

  async remove(id: number, user: User): Promise<{ message: string }> {
    checkIsAdmin(user, "Only Admin can delete country.");

    const country = await this.findOne(id);
    if (!country) {
      throw new NotFoundException('Country not found.');
    }

    await this.countryRepository.delete(id);
    return { message: 'Country deleted successfully.' };
  }

  async getCountriesCounts(user: User): Promise<{ activeCountries: number; totalCountries: number }> {
    checkIsAdmin(user, "Only Admin can access this data.");

    const totalCountries = await this.countryRepository.count();
    const activeCountries = await this.countryRepository.count({
      where: { status: 1, is_deleted: false },
    });

    return { totalCountries, activeCountries };
  }
}
