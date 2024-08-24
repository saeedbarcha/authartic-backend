import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportProblemDto {

  @IsString()
  @IsNotEmpty()
  reporting_text: string;
}
