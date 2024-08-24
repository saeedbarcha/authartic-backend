// src/auth/dto/signup.dto.ts
import { IsString, IsUrl, IsEmail,IsPhoneNumber, IsArray, IsEnum, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { UserRoleEnum } from '../enum/user.role.enum';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    user_name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsDateString()
    date_of_birth?: Date;

    @IsOptional()
    @IsString()
    primary_content?: string;

    @IsOptional()
    @IsString()
    about_brand?: string;

    @IsOptional()
    @IsString()
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
    country_id?: number;

    @IsOptional()
    attachment_id?: number;

    @IsOptional()
    validation_code_id?: number;
}
