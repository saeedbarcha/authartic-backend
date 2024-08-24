import { IsNotEmpty,IsString, IsNumber, } from 'class-validator';


export class CreateValidationCodeDto {
    @IsNotEmpty()
    @IsNumber()
    no_Validation_code ? : number;

}
