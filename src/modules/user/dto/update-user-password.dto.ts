import { IsString, IsUrl, IsPhoneNumber, IsArray, IsEnum, IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';

export class UpdateUserPasswordDto {
    @IsNotEmpty()
    @IsString()
    password: string;
}
