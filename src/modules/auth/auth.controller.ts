import { Controller, Get, Put, Query, Post,Res,  Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from 'src/modules/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  

    constructor(
        private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // @Put()
    // async logout(@GetUser() user: User) {
    //     return this.authService.logout(user);
    // }


    
}
