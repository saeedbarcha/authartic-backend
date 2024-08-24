// src/modules/report-problem/report-problem.controller.ts

import { Controller,UseGuards,Query,Put, Get, Req, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/entities/user.entity';
import { GetUser } from '../../auth/get-user.decorator';
import { ReportProblemService } from '../service/report-problem.service';
import { CreateReportProblemDto } from '../dto/create-report-problem.dto';
import { RespondReportProblemDto } from '../dto/respond-report-problem.dto';
import { SearchReportProblemDto } from '../dto/search-report-problem.dto';
import { ReportProblem } from '../entities/report-problem.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('report-problem')
export class ReportProblemController {
  constructor(private readonly reportProblemService: ReportProblemService) {}

  @Post(':id')
  async createReport(@Param('id') id: string, @Body() createReportProblemDto: CreateReportProblemDto, @GetUser() user: User) {
    return this.reportProblemService.createReport(+id, createReportProblemDto, user);
  }


}
