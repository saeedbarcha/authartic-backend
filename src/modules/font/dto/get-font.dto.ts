// src/modules/font/dto/get-font.dto.ts
import { Expose } from 'class-transformer';

export class GetFontDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  family: string;
}
