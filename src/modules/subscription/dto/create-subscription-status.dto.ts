import { IsString, IsDateString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
export class CreateSubscriptionStatusDto {
   
    @IsNumber()
    total_certificates_issued: number;

 
    @IsNumber()
    remaining_certificates: number;


    @IsDateString()
    plan_activated_date: Date;


    @IsDateString()
    plan_expiry_date: Date;


    @IsBoolean()
    is_expired: boolean;


    @IsObject()
    additional_feature_status: Record<string, any>;

    @IsNumber()
    additional_cost: number;

    @IsOptional()
    subscriptionPlan: SubscriptionPlan;
}
