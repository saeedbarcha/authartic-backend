import { IsString, IsDateString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { CreateSubscriptionStatusDto } from './create-subscription-status.dto';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';


export class UpdateSubscriptionStatusDto  { 
    @IsOptional()
    @IsNumber()
    total_certificates_issued?: number;

    @IsOptional()
    @IsNumber()
    remaining_certificates?: number;

    @IsOptional()
    @IsDateString()
    plan_activated_date?: Date;

    @IsOptional()
    @IsDateString()
    plan_expiry_date?: Date;

    @IsOptional()
    @IsBoolean()
    is_expired?: boolean;

    @IsOptional()
    @IsObject()
    additional_feature_status?: Record<string, any>;

    @IsOptional()
    @IsNumber()
    additional_cost?: number;

    @IsOptional()
    subscriptionPlan?: SubscriptionPlan;
}
