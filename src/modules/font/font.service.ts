// src/modules/font/font.service.ts
import { Injectable,  NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFontDto } from './dto/create-font.dto';
import { UpdateFontDto } from './dto/update-font.dto';
import { Font } from './entities/font.entity';
import { plainToInstance } from 'class-transformer';
import { GetFontDto } from './dto/get-font.dto';
import { User } from '../auth/entities/user.entity';
import { checkIsAdmin } from 'src/utils/check-is-admin.util';


@Injectable()
export class FontService {
  constructor(
    @InjectRepository(Font)
    private readonly fontRepository: Repository<Font>,
  ) { }

  // public
  async findActive(): Promise<GetFontDto[]> {
    const activeFonts = await this.fontRepository.find({
      where: { status: 1, is_deleted: false },
    });

    if (activeFonts.length === 0) {
      throw new NotFoundException('No font found.');
    }

    return plainToInstance(GetFontDto, activeFonts, { excludeExtraneousValues: true });
  }

  // admin
  async findAllFonts({
    user,
    page = 1,
    limit = 10,
    name = '',
    isActive = true,
  }: {
    user: User;
    page: number;
    limit: number;
    name: string;
    isActive: boolean;
  }): Promise<{ totalCount: number; totalPages: number; currentPage: number; data: GetFontDto[] }> {
    checkIsAdmin(user, "Only Admin can access this data.");

    const query = this.fontRepository.createQueryBuilder('font');

    if (isActive) {
      query.where('font.is_deleted = false');
    } else {
      query.where('font.is_deleted = true');
    }

    query.skip((page - 1) * limit).take(limit);

    if (name) {
      query.andWhere('font.name ILIKE :name', { name: `%${name}%` });
    }

    const totalCount = await query.getCount();
    const fonts = await query.getMany();

    if (fonts.length === 0) {
      throw new NotFoundException('No fonts found.');
    }

    const fontDtos = plainToInstance(GetFontDto, fonts, { excludeExtraneousValues: true });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: fontDtos,
    };
  }

  async createFont(createFontDto: CreateFontDto, user: User): Promise<GetFontDto> {
    checkIsAdmin(user, "Only Admin can add new fonts.");
    const existingFont = await this.fontRepository.findOne({ where: { name: createFontDto.name } });
    if (existingFont) {
      throw new ConflictException('Font with this name already exists.');
    }

    const font = this.fontRepository.create(createFontDto);
    const savedFont = await this.fontRepository.save(font);
    return plainToInstance(GetFontDto, savedFont, { excludeExtraneousValues: true });
  }

  async updateFont(id: number, updateFontDto: UpdateFontDto, user: User): Promise<GetFontDto> {
    checkIsAdmin(user, "Only Admin can perform this action.");

    const isNameAlready = await this.fontRepository.findOne({ where: { name: updateFontDto.name } });

    if (isNameAlready) {
      throw new NotFoundException('Font with same name already exists.');
    }

    const existingFont = await this.fontRepository.findOne({
      where: {
        id,
      }
    });
    if (!existingFont) {
      throw new NotFoundException('Font not found.');
    }

    const updateResult = await this.fontRepository.update(id, updateFontDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException('Font not updated.');
    }

    const updatedFont = await this.fontRepository.findOne({ where: { id } });

    return plainToInstance(GetFontDto, updatedFont, { excludeExtraneousValues: true });
  }

  async findOneFont(id: number, user: User): Promise<GetFontDto> {
    checkIsAdmin(user, "Only Admin can access this data.");
  
    const existingFont = await this.fontRepository.findOne({
      where: {
        id,
        is_deleted: false
      }
    });
    if (!existingFont) {
      throw new NotFoundException('Font not found.');
    }

    return plainToInstance(GetFontDto, existingFont, { excludeExtraneousValues: true });
  }

  async removeFont(id: number, user: User): Promise<{ message: string }> {
    checkIsAdmin(user, 'Only Admin can perform this action.');

    const font = await this.fontRepository.findOne({
      where: {
        id,
        is_deleted: false
      }
    });
    if (!font) {
      throw new NotFoundException('Font not found.');
    }

    font.is_deleted = true;
    await this.fontRepository.save(font);
    return { message: 'Font deleted successfully.' };
  }

  async countFonts(user: User): Promise<{ activeFonts: number | 0; totalFonts: number | 0 }> {
    checkIsAdmin(user, "Only Admin can access this data.");
    const totalFonts = await this.fontRepository.count();
    const activeFonts = await this.fontRepository.count({
      where: { status: 1, is_deleted: false },
    });
    return { activeFonts, totalFonts };
  }

}
