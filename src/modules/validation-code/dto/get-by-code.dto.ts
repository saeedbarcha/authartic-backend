import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';

export class GetValidationCodeDto {
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  code: string;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  is_used: boolean;
}
