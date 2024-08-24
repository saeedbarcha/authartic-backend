import { IsString, IsNumber } from 'class-validator';

export class GetUserDto {
    @IsNumber()
    page: number;

    @IsString()
    searchQuery: string;

    @IsString()
    role: string;
}