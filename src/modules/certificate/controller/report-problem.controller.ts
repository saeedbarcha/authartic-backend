// src/modules/report-problem/report-problem.controller.ts

import { Controller,UseGuards,Post, Body, Param} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/modules/user/entities/user.entity';
import { GetUser } from '../../auth/get-user.decorator';
import { ReportProblemService } from '../service/report-problem.service';
import { CreateReportProblemDto } from '../dto/create-report-problem.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('report-problem')
export class ReportProblemController {
  constructor(private readonly reportProblemService: ReportProblemService) {}

  @Post(':id')
  async createReport(@Param('id') id: string, @Body() createReportProblemDto: CreateReportProblemDto, @GetUser() user: User) {
    return this.reportProblemService.createReport(+id, createReportProblemDto, user);
  }


}
