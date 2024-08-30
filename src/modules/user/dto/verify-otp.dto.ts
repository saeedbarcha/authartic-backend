import { IsString,  IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from '../enum/user.role.enum';

export class VerifyOtpDto {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp: string;

    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}
