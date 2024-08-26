import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string, role:UserRoleEnum): Promise<any> {
        const user = await this.authService.validateUser(email, password, role);
        if (!user) {
            throw new UnauthorizedException('Invalid email or username, please check your credentials and try again.');
        }
        return user;
    }
}
