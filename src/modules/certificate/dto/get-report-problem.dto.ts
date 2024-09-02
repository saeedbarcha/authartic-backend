import { ReportProblemStatusEnum } from "src/modules/common/report-problem-status.enum";

export class GetReportProblemDto {
  id: number;
  reporting_date: string; // ISO string
  reporting_text: string;
  response_date: string | null; // ISO string or null
  response_text: string | null;
  report_status: ReportProblemStatusEnum;
  vendor: {
    id: number;
    user_name: string;
    email: string;
    role: string;
    is_verified_email: boolean;
  };
  certificate_info: {
    id: number;
    name: string;
    description: string;
    font: string;
    font_color: string;
    bg_color: string;
    issued: number;
    issued_date: string; // ISO string
    product_sell: string;
    saved_draft: boolean;
  };
}
