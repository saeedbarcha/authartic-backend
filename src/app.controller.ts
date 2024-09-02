import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }


  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }


  @Post('seed/user')
  seedUser(@Body() createUserDto: any): string {
    return this.appService.seedUser(createUserDto);
  }
}
