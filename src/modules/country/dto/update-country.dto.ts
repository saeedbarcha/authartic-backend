import { IsOptional, IsString,IsBoolean,  IsNumber } from 'class-validator';

export class UpdateCountryDto  {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code : string;

    @IsOptional()
    @IsBoolean()
    is_deleted: boolean;
  
    @IsOptional()
    @IsNumber()
    status:number
}
