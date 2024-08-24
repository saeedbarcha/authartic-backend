import { IsNotEmpty, IsString, MaxLength , IsOptional, IsBoolean, IsInt} from 'class-validator';

export class UpdateFontDto  {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    name?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(50)
    family?: string;

    @IsOptional()
    @IsInt()
    status?: number;

}
