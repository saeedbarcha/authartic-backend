import { Controller, Get, Query, Post, Res, Put, UseGuards, Req, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';


@Controller('user')
export class UserController {
  private readonly frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000';
  constructor(
    private readonly userService: UserService,) { }

    @UseGuards(AuthGuard('jwt')) 
    @Put('update-password')
    async updatePassword( @Body() updateUserPasswordDto: UpdateUserPasswordDto, @GetUser() user: User) {
     return this.userService.updatePassword(updateUserPasswordDto, user);
    }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@Request() req) {
    return this.userService.findUserById(req.user.id);
  }

  @Get('activate-vendor-account')
  async activateAccount(@Query('token') token: string, @Res() res: Response): Promise<void> {
    try {
      const activatedUser = await this.userService.activateAccount(token);
      res.redirect(`${this.frontendUrl}/`);
    } catch (error) {
      res.redirect(`${this.frontendUrl}/activation-failed`);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.updateUser(updateUserDto, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resend-verification-email')
  async resendVerificationEmail(@GetUser() user: User): Promise<{ message: string }> {
    await this.userService.resendVerificationEmail(user);
    return { message: `A verification email has been sent to ${user.email}. Please verify your account.` };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('activate-user-account')
  async activateAccountByUser(@Body('otp') otp: string, @GetUser() user: User): Promise<{ message: string }> {
    return await this.userService.activateAccountByUser(otp, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('send-otp-email')
  async resendOtpEmail( @GetUser() user: User): Promise<{ message: string }> {
    return await this.userService.resendOtpEmail(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response) {
    response.clearCookie('token');
    return { messages: "Logout successfully" };
  }

}
