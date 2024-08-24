// src/seeds/font.seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Font } from 'src/modules/font/entities/font.entity';

@Injectable()
export class FontSeederService {
  constructor(
    @InjectRepository(Font)
    private readonly fontRepository: Repository<Font>,
  ) {}

  async seed() {
    await this.seedFonts();
    console.log('Seeding fonts completed');
  }

  private async seedFonts() {
    const fonts = [
      { name: 'Arial', family: 'Arial, sans-serif' },
      { name: 'Helvetica', family: 'Helvetica, sans-serif' },
      { name: 'Times New Roman', family: 'Times New Roman, Times, serif' },
      { name: 'Courier New', family: 'Courier New, Courier, monospace' },
      { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
      { name: 'Georgia', family: 'Georgia, serif' },
      { name: 'Trebuchet MS', family: 'Trebuchet MS, Helvetica, sans-serif' },
      { name: 'Lucida Console', family: 'Lucida Console, Monaco, monospace' },
      { name: 'Impact', family: 'Impact, Charcoal, sans-serif' },
      { name: 'Comic Sans MS', family: 'Comic Sans MS, Comic Sans, cursive' },
    ];

    for (const fontData of fonts) {
      const existingFont = await this.fontRepository.findOne({ where: { name: fontData.name } });
      if (!existingFont) {
        const font = this.fontRepository.create(fontData);
        await this.fontRepository.save(font);
      }
    }
  }
}
