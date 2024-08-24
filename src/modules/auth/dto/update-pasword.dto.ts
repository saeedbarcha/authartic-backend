import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPasswordDto {

    @IsNotEmpty()
    @IsString()
    current_password: string;

    @IsString()
    new_password: string;


}
