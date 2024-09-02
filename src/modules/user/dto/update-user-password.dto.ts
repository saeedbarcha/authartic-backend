import { IsString,  IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from '../enum/user.role.enum';

export class UpdateUserPasswordDto {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}
