import { Expose } from 'class-transformer';
import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetSubscriptionPlanFeatureDto {
  @Expose()
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  value: string;

  @Expose()
  @IsOptional()
  @IsString()
  additional_cost: string | null;
}
