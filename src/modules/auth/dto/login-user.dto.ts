import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRoleEnum } from '../enum/user.role.enum';

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    role: UserRoleEnum;
}