import { IsNotEmpty,IsOptional, IsInt, IsString } from 'class-validator';
import { ReportProblemStatusEnum } from 'src/modules/common/report-problem-status.enum';

export class RespondReportProblemDto {

  @IsString()
  @IsNotEmpty()
  response_text: string;

  
  @IsOptional()
  report_status?: ReportProblemStatusEnum;

}
