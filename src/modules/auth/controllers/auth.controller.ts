import { Controller, Get, Put, Query, Post,Res, Delete, UseGuards, Req, Request, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from '../entities/user.entity';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  
  private readonly frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000';
    constructor(
        private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('activate')
    async activateAccount(@Query('token') token: string, @Res() res: Response): Promise<void> {
      try {
        const activatedUser = await this.authService.activateAccount(token);
        res.redirect(`${this.frontendUrl}/`);
      } catch (error) {
        res.redirect(`${this.frontendUrl}/activation-failed`);
      }
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Put()
    async logout(@GetUser() user: User) {
        return this.authService.logout(user);
    }

    @Post('resend-verification-email')
    async resendVerificationEmail(@Body('email') email: string): Promise<{ message: string }> {
        await this.authService.resendVerificationEmail(email);
        return { message: `A verification email has been sent to ${email}. Please verify your account.` };
    }
    
}
