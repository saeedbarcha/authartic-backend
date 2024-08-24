import { IsString, IsUrl, IsPhoneNumber, IsArray, IsEnum, IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';
import { UserRoleEnum } from '../enum/user.role.enum';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    user_name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsDateString()
    date_of_birth?: string;

    @IsOptional()
    @IsString()
    primary_content?: string;

    @IsOptional()
    @IsString()
    about_brand?: string;

    @IsOptional()
    @IsUrl()
    website_url?: string;

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    social_media?: string[];

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    other_links?: string[];

    @IsOptional()
    @IsInt()
    country_id?: number;

    @IsOptional()
    @IsInt()
    attachment_id?: number;
    
    @IsOptional()
    @IsInt()
    validation_code_id?: number;

    @IsOptional()
    @IsInt()
    subscription_plan_id?: number;
}
