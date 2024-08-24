// src/attachment/dto/attachment.dto.ts
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class GetAttachmentDto {
  @Expose()
  @IsNumber()
  @Type(() => Number) 
  @IsNotEmpty() 
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty() 
  url: string;

  @Expose()
  @IsString()
  @IsNotEmpty() 
  file_type: string;

  @Expose()
  @IsString()
  @IsNotEmpty() 
  file_name: string;
}
