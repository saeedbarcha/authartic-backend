import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException

} from '@nestjs/common';
import { ILike, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserProfile } from 'src/modules/user/entities/user-profile.entity';
import { VendorInfo } from 'src/modules/user/entities/vendor-info.entity';
import { RegisterDto } from './dto/register-user.dto';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { Country } from 'src/modules/country/entities/country.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { ValidationCode } from 'src/modules/validation-code/entities/validation-code.entity';
import { MailService } from 'src/modules/common/service/email.service';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { UserService } from 'src/modules/user/user.service';
import { User } from '../user/entities/user.entity';


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ValidationCode)
        private readonly validationCodeRepository: Repository<ValidationCode>,
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private jwtService: JwtService,
        private readonly dataSource: DataSource
    ) { }

    async validateUser(email: string, pass: string, role: UserRoleEnum): Promise<any> {
        if (!email) {
            throw new BadRequestException('E-mail is required.');
        }
        if (!pass) {
            throw new BadRequestException('Password is required.');
        }
        if (!role) {
            throw new BadRequestException('Role is required.');
        }
        if (![UserRoleEnum.ADMIN, UserRoleEnum.USER, UserRoleEnum.VENDOR].includes(role)) {
            throw new BadRequestException('Role is incorrect.');
        }
        const user = await this.userRepository.findOne({
            where: { email: email, role: role }
        });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, created_at, updated_at, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto) {
        const { email, password, role } = loginUserDto;

        const user = await this.validateUser(email, password, role);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        } else {
            const userInfo = await this.userService.findUserById(user.id);
            const payload = { email: user.email, role: user.role };
            return {
                user: userInfo,
                access_token: this.jwtService.sign(payload)
            };
        }
    }

    async logout(user: User) {
        return { message: 'Logged out successfully' };
    }


    async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            const {
                user_name,
                email,
                password,
                role,
                attachment_id,
                country_id,
                validation_code_id,
                ...rest
            } = registerDto;
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
            if (!user_name) {
                throw new BadRequestException('User name is required');
            } else if (!email) {
                throw new BadRequestException('E-mail is required');
            } else if (!password) {
                throw new BadRequestException('Password is required');
            } else if (!role) {
                throw new BadRequestException('Role is required');
            }
    
            const user = new User();
            user.user_name = user_name;
            user.email = email;
            user.password = hashedPassword;
            user.role = role;
    
            if (country_id) {
                const isCountry = await queryRunner.manager.findOne(Country, {
                    where: { id: country_id }
                });
                if (!isCountry) {
                    throw new BadRequestException('Invalid country ID');
                }
                user.country = isCountry;
            }
    
            const savedUser = await queryRunner.manager.save(user);
    
            if (role === UserRoleEnum.USER) {
                if (!rest.phone) {
                    throw new BadRequestException('Phone Number is required');
                } else if (!country_id) {
                    throw new BadRequestException('Country is required');
                } else if (!rest.date_of_birth) {
                    throw new BadRequestException('Date of Birth is required');
                }
                const userProfile = new UserProfile();
                userProfile.phone = rest.phone;
                userProfile.date_of_birth = rest.date_of_birth;
                userProfile.user = savedUser;
    
                if (attachment_id) {
                    const attachment = await queryRunner.manager.findOne(Attachment, {
                        where: { id: attachment_id }
                    });
                    if (attachment) {
                        userProfile.attachment = attachment;
                    }
                }
    
                if (!userProfile.phone || !userProfile.date_of_birth) {
                    throw new BadRequestException('Invalid phone or date of birth');
                }
    
                const savedUserProfile = await queryRunner.manager.save(userProfile);
                savedUser.userProfile = savedUserProfile; // Set the userProfile in the User entity
                await queryRunner.manager.save(savedUser); // Update the user entity
            }
    
            if (role === UserRoleEnum.VENDOR) {
                if (!rest.primary_content) {
                    throw new BadRequestException('Primary content is required');
                } else if (!country_id) {
                    throw new BadRequestException('Country is required');
                } else if (!rest.phone) {
                    throw new BadRequestException('Phone Number is required');
                } else if (!attachment_id) {
                    throw new BadRequestException('Logo is required');
                } else if (!rest.about_brand) {
                    throw new BadRequestException('Tell Us About Your Brand is required');
                }
                const vendorInfo = new VendorInfo();
                vendorInfo.primary_content = rest.primary_content;
                vendorInfo.phone = rest.phone;
                vendorInfo.about_brand = rest.about_brand;
                vendorInfo.website_url = rest.website_url;
                vendorInfo.social_media = rest.social_media;
                vendorInfo.other_links = rest.other_links;
                vendorInfo.user = savedUser;
    
                if (validation_code_id) {
                    const isValidationCode = await queryRunner.manager.findOne(ValidationCode, {
                        where: { id: validation_code_id, is_deleted: false, is_used: false }
                    });
                    if (isValidationCode) {
                        vendorInfo.validationCode = isValidationCode;
                    }
                }
    
                if (attachment_id) {
                    const attachment = await queryRunner.manager.findOne(Attachment, {
                        where: { id: attachment_id }
                    });
                    if (!attachment) {
                        throw new BadRequestException('Invalid attachment ID');
                    }
                    vendorInfo.attachment = attachment;
                }
    
                const savedVendorInfo = await queryRunner.manager.save(vendorInfo);
                savedUser.vendorInfo = savedVendorInfo; // Set the vendorInfo in the User entity
                await queryRunner.manager.save(savedUser); // Update the user entity
            }
    
            const token = this.jwtService.sign({ email: user.email });
            await this.mailService.sendActivationEmail(registerDto.email, token);
    
            await queryRunner.commitTransaction();
    
            if (savedUser && validation_code_id) {
                await this.validationCodeRepository.update(validation_code_id, { is_used: true });
            }
    
            return this.userService.findUserById(savedUser.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error.detail && error.detail.includes('email')) {
                throw new BadRequestException('Email is already in use');
            } else if (error.detail && error.detail.includes('phone')) {
                throw new BadRequestException('Phone number is already in use');
            } else if (error.detail && error.detail.includes('Failed to send email')) {
                throw new BadRequestException('Failed to send activation email, user registration failed.');
            } else {
                throw new BadRequestException(`Failed to add user, ${error?.detail?.message || error?.message}`);
            }
        } finally {
            await queryRunner.release();
        }
    }
    
    async findOneByEmail(email: string): Promise<User> {
        return this.userRepository.findOne({ where: { email } });
    }


}
