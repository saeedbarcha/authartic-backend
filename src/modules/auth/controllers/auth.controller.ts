import { Controller, Get, Put, Query, Post, Delete, UseGuards, Req, Request, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from '../entities/user.entity';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }
    @Post('activate')
    async activate(@Query('token') token: string): Promise<{ message: string }> {
        if (!token) {
            throw new BadRequestException('Activation token is required');
        }

        await this.authService.activateAccount(token);
        return { message: 'Account activated successfully' };
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
