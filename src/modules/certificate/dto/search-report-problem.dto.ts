import { IsOptional, IsInt, IsIn, IsString, Min } from 'class-validator';

export class SearchReportProblemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  vendor_name?: string;

  @IsOptional()
  @IsInt()
  report_id?: number;

  @IsOptional()
  @IsIn([1, 2, 3, 4])
  status?: number;
}
