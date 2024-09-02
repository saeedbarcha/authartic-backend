import { Expose, Type } from 'class-transformer';
import { IsInt, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { GetSubscriptionPlanFeatureDto } from './get-subscription-plan-feature.dto';

export class GetSubscriptionPlanDto {
  @Expose()
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Expose()
  @Type(() => GetSubscriptionPlanFeatureDto)
  subscriptionPlanFeatures: GetSubscriptionPlanFeatureDto[];
}
