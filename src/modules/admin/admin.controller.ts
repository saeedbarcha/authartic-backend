import { Controller, UseGuards, Query, Put, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { CreateCountryDto } from '../country/dto/create-country.dto';
import { CountryService } from '../country/country.service';
import { UpdateCountryDto } from '../country/dto/update-country.dto';
import { ValidationCodeService } from '../validation-code/validation-code.service';
import { CreateValidationCodeDto } from '../validation-code/dto/create-validation-code.dto';
import { GetCountryDto } from '../country/dto/get-country.dto';
import { FontService } from '../font/font.service';
import { CreateFontDto } from '../font/dto/create-font.dto';
import { GetFontDto } from '../font/dto/get-font.dto';
import { UpdateFontDto } from '../font/dto/update-font.dto';
import { ReportProblemService } from '../certificate/service/report-problem.service';
import { RespondReportProblemDto } from '../certificate/dto/respond-report-problem.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { VerifyVendorDto } from '../user/dto/verify-vendor.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(
    private readonly countryService: CountryService,
    private readonly validationCodeService: ValidationCodeService,
    private readonly userService: UserService,
    private readonly reportProblemService: ReportProblemService,
    private readonly fontService: FontService,
  ) { }


  //  vendor api's
  @Get('vendor/all-vendors')
  async findAllVendors(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('is_verified') is_verified?: boolean,
    @Query('name') name?: string

  ): Promise<any> {

    return this.userService.findAllVendors(user, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      is_verified,
      name,
    });
  }

  @Put("vendor/verify")
  verifyVendor(@Body() verifyVendorDto: VerifyVendorDto, @GetUser() user: User): Promise<Omit<User, 'password'>> {
    return this.userService.verifyVendor(verifyVendorDto, user);
  }

  // user api's
  @Get('all-users')
  async findAllUsers(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string
  ) {
    return this.userService.findAllUsers(user, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      name,
    });
  }

  //  country api's
  @Post("country")
  createCountry(@Body() createCountryDto: CreateCountryDto, @GetUser() user: User) {
    return this.countryService.create(createCountryDto, user);
  }

  @Get('country/all-countries')
  async findAllCountries(
    @GetUser() user: User,
    @Query('is_active') isActive?: boolean,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.countryService.findCountries(
      user,
      isActive !== undefined ? isActive : true,
      name,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );
  }

  @Get('country/country-counts')
  getCountriesCounts(@GetUser() user: User) {
    return this.countryService.getCountriesCounts(user);
  }

  @Get('country/:id')
  findOneCountry(@Param('id') id: string) {
    return this.countryService.findOne(+id);
  }

  @Put('country/:id')
  updateCountry(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto, @GetUser() user: User) {
    return this.countryService.updateCountry(+id, updateCountryDto, user);
  }

  @Delete('country/:id')
  removeCountry(@Param('id') id: string, @GetUser() user: User) {
    return this.countryService.remove(+id, user);
  }


  //  validation code api's
  @Post('validation-code')
  async createValidationCode(@Body() createValidationCodeDto: CreateValidationCodeDto, @GetUser() user: User) {
    const validationCode = await this.validationCodeService.create(createValidationCodeDto, user);
    return {
      message: 'Validation code created successfully',
      data: validationCode,
    };
  }

  @Get('validation-code/count')
  countValidationCodes(@GetUser() user: User) {
    return this.validationCodeService.countValidationCodes(user);
  }

  @Get("validation-code")
  async findValidationCodes(
    @GetUser() user: User,
    @Query('is_used') isUsed?: boolean,
    @Query('code') code?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.validationCodeService.findValidationCodes(
      user,
      isUsed !== undefined ? isUsed : false,
      code,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );
  }



  // fonts apis
  @Post("font")
  createFont(@Body() createFontDto: CreateFontDto, @GetUser() user: User): Promise<GetFontDto> {
    return this.fontService.createFont(createFontDto, user);
  }

  @Get('font/all-fonts')
  async findAllFonts(
    @GetUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('name') name: string = '',
    @Query('is_active') isActive: string = 'true',
  ) {
    return this.fontService.findAllFonts({
      user,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      name,
      isActive: isActive === 'true',
    });
  }

  @Get('font/count')
  countFonts(@GetUser() user: User): Promise<{ activeFonts: number; totalFonts: number }> {
    return this.fontService.countFonts(user);
  }

  @Get('font/:id')
  findOneFont(@Param('id') id: string, @GetUser() user: User,) {
    return this.fontService.findOneFont(+id, user);
  }

  @Put('font/:id')
  updateFont(@Param('id') id: string, @Body() updateFontDto: UpdateFontDto, @GetUser() user: User) {
    return this.fontService.updateFont(+id, updateFontDto, user);
  }

  @Delete('font/:id')
  removeFont(@Param('id') id: string, @GetUser() user: User) {
    return this.fontService.removeFont(+id, user);
  }

  // reports
  @Get('report-problem')
  async getReports(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('vendor_name') vendorName?: string,
    @Query('report_id') reportId?: number,
    @Query('status') status?: number
  ): Promise<{
    count: number;
    pages: number;
    limit: number;
    currentPage: number;
    status: number;
    vendor_name?: string;
    report_id?: number;
    data: any[];
  }> {
    return this.reportProblemService.getReports(
      user,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      vendorName,
      reportId ? Number(reportId) : undefined,
      status ? Number(status) : undefined
    );
  }

  @Put('report-problem/:id')
  async respondToReport(@Param('id') id: string, @Body() respondReportProblemDto: RespondReportProblemDto, @GetUser() user: User) {
  //  console.log("id..........", id)
    return this.reportProblemService.respondToReport(+id, respondReportProblemDto, user);
  }
}
