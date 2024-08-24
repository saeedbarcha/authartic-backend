// src/modules/font/dto/create-font.dto.ts
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFontDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  family: string;
}
