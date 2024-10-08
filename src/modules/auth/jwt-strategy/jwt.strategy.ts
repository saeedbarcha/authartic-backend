
import { Injectable , UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-strategy.interface';
import { AuthService } from '../auth.service';
import { User } from 'src/modules/user/entities/user.entity';


export class CustomUnauthorizedException extends UnauthorizedException {
    constructor(message: string) {
        super(message);
    }
}


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'Keyy',
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.authService.findOneByEmail(payload.email);
        if (!user) {
            throw new CustomUnauthorizedException('User token is required.');
        }
        return user;
    }
}
