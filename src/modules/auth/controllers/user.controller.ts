import { Controller, Get, Post, Put, UseGuards, Req, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/modules/auth/get-user.decorator'
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../service/user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService) { }


  @Get('profile')
  async profile(@Request() req) {
    return this.userService.findUserById(req.user.id);
  }

  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.updateUser(updateUserDto, user);
  }

}
