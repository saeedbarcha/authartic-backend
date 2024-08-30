import { Controller, Get, Query, Post, Res, Put, UseGuards, Req, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { SearchEmailDto } from './dto/search-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';


@Controller('user')
export class UserController {
  private readonly frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000';
  constructor(
    private readonly userService: UserService,) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async profile(@Request() req) {
      return this.userService.findUserById(req.user.id);
    }
// activate/verifiy vendors account
    @Get('activate')
    async activateVendorAccount(@Query('token') token: string, @Res() res: Response): Promise<void> {
      try {
        const activatedUser = await this.userService.activateVendorAccount(token);
        res.redirect(`${this.frontendUrl}/`);
      } catch (error) {
        res.redirect(`${this.frontendUrl}/activation-failed`);
      }
    }

    @Post('find-email')
    async SearchIsEmail(@Body() searchEmailDto: SearchEmailDto) {
      return this.userService.SearchIsEmail(searchEmailDto);
    }

    @Put('update-password')
    async updatePassword( @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
     return this.userService.updatePassword(updateUserPasswordDto);
    }

    @Post('resend-otp-email')
    async resendOtpEmailToBoth(@Body() searchEmailDto: SearchEmailDto,) {
     return this.userService.resendOtpEmailToBoth(searchEmailDto);
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
  async reSendOtpEmail( @GetUser() user: User): Promise<{ message: string }> {
    return await this.userService.reSendOtpEmail(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response) {
    response.clearCookie('token');
    return { messages: "Logout successfully" };
  }
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    return await this.userService.verifyOtp(verifyOtpDto);
  }

}


// 
// import { Controller, Get, Query, Post, Res, Put, UseGuards, Req, Request, Body } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { GetUser } from 'src/modules/auth/get-user.decorator'
// import { User } from './entities/user.entity';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { UserService } from './user.service';
// import { Response } from 'express';

// @Controller('user')
// export class UserController {
//   private readonly frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000';
//   constructor(
//     private readonly userService: UserService,) { }

//   @UseGuards(AuthGuard('jwt'))
//   @Get('profile')
//   async profile(@Request() req) {
//     return this.userService.findUserById(req.user.id);
//   }

//   @Get('activate')
//   async activateAccount(@Query('token') token: string, @Res() res: Response): Promise<void> {

//     try {
//       const activatedUser = await this.userService.activateAccount(token);
//       res.redirect(`${this.frontendUrl}/`);
//     } catch (error) {
//       res.redirect(`${this.frontendUrl}/activation-failed`);
//     }
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Put()
//   async updateUser(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
//     return this.userService.updateUser(updateUserDto, user);
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post('resend-verification-email')
//   async resendVerificationEmail(@GetUser() user: User): Promise<{ message: string }> {
//     await this.userService.resendVerificationEmail(user);
//     return { message: `A verification email has been sent to ${user.email}. Please verify your account.` };
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Post('logout')
//   async logout(@Request() req, @Res({ passthrough: true }) response) {
//     response.clearCookie('token');
//     return { messages: "Logout successfully" };
//   }

// }
