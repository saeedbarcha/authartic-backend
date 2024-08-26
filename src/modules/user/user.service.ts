import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { Country } from 'src/modules/country/entities/country.entity';
import { ValidationCode } from 'src/modules/validation-code/entities/validation-code.entity';
import { checkIsAdmin } from 'src/utils/check-is-admin.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { VendorInfo } from './entities/vendor-info.entity';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import { MailService } from '../common/service/email.service';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VendorInfo)
    private readonly vendorInfoRepository: Repository<VendorInfo>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource
  ) { }


  async updateUser(updateUserDto: UpdateUserDto, user: User): Promise<Omit<User, 'password'>> {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
        relations: ['userProfile', 'vendorInfo', 'country', 'subscriptionStatus'],
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${user.id} not found`);
      }




      existingUser.user_name = updateUserDto.user_name || existingUser.user_name;


      if (updateUserDto.country_id) {
        const country = await queryRunner.manager.findOne(Country, { where: { id: updateUserDto.country_id } });
        if (!country) {
          throw new NotFoundException(`Country with ID ${updateUserDto.country_id} not found`);
        }
        existingUser.country = country;
      }

      if (existingUser.role === 'USER') {
        existingUser.userProfile.phone = updateUserDto.phone || existingUser.userProfile.phone;
        existingUser.userProfile.date_of_birth = new Date(updateUserDto.date_of_birth) || existingUser.userProfile.date_of_birth;
        if (updateUserDto.attachment_id) {
          const attachment = await queryRunner.manager.findOne(Attachment, { where: { id: updateUserDto.attachment_id } });
          if (!attachment) {
            throw new NotFoundException(`Attachment with ID ${updateUserDto.attachment_id} not found`);
          }
          existingUser.userProfile.attachment = attachment || existingUser.userProfile.attachment;
        }

      } else if (existingUser.role === 'VENDOR') {
        existingUser.vendorInfo.phone = updateUserDto.phone || existingUser.vendorInfo.phone;
        existingUser.vendorInfo.primary_content = updateUserDto.primary_content || existingUser.vendorInfo.primary_content;
        existingUser.vendorInfo.about_brand = updateUserDto.about_brand || existingUser.vendorInfo.about_brand;
        existingUser.vendorInfo.website_url = updateUserDto.website_url || existingUser.vendorInfo.website_url;
        existingUser.vendorInfo.social_media = updateUserDto.social_media || existingUser.vendorInfo.social_media;
        existingUser.vendorInfo.other_links = updateUserDto.other_links || existingUser.vendorInfo.other_links;
        if (updateUserDto.attachment_id) {
          const isAttachment = await queryRunner.manager.findOne(Attachment, { where: { id: updateUserDto.attachment_id } });
          if (!isAttachment) {
            throw new NotFoundException(`Attachment not found`);
          }
          existingUser.vendorInfo.attachment = isAttachment || existingUser.vendorInfo.attachment;
        }
      }

      await queryRunner.manager.save(User, existingUser);

      if (existingUser.userProfile) {
        await queryRunner.manager.save(UserProfile, existingUser.userProfile);
      }
      if (existingUser.vendorInfo) {
        await queryRunner.manager.save(VendorInfo, existingUser.vendorInfo);
      }

      await queryRunner.commitTransaction();

      return this.findUserById(existingUser.id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // admin
  async verifyVendor(verifyVendorDto: VerifyVendorDto, user: User): Promise<Omit<User, 'password'>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { vendor_id, validation_code } = verifyVendorDto;

      checkIsAdmin(user, 'Only Admin can verify vendors.')

      const existingVendor = await queryRunner.manager.findOne(User, { where: { id: vendor_id, role: UserRoleEnum.VENDOR, is_deleted: false }, relations: ['vendorInfo', 'vendorInfo.validationCode'] });
      if (!existingVendor) {
        throw new NotFoundException('Vendor does not exist.');
      }
      if (existingVendor.vendorInfo.validationCode) {
        throw new NotFoundException('Vendor is already verified.');
      }
      const existingValidationCode = await queryRunner.manager.findOne(ValidationCode, { where: { code: validation_code, is_deleted: false, is_used: false } });
      if (!existingValidationCode) {
        throw new NotFoundException("Validation Code not found or already used.");
      }

      if (!existingVendor.vendorInfo) {
        throw new NotFoundException("Vendor info not found.");
      }

      existingVendor.vendorInfo.validationCode = existingValidationCode;
      existingValidationCode.is_used = true;
      existingValidationCode.vendorInfo = existingVendor.vendorInfo;

      await queryRunner.manager.save(existingVendor.vendorInfo);
      await queryRunner.manager.save(existingValidationCode);
      await queryRunner.commitTransaction();

      return this.findUserById(existingVendor.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async findAllVendors(
    user: User,
    { page = 1, limit = 10, is_verified = true, name }: { page?: number; limit?: number; is_verified?: boolean; name?: string }
  ): Promise<any> {

    checkIsAdmin(user, 'Only an admin can access this data')

    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.vendorInfo', 'vendorInfo')
      .leftJoinAndSelect('vendorInfo.attachment', 'attachment')
      .leftJoinAndSelect('vendorInfo.validationCode', 'validationCode')
      .where('user.role = :role', { role: UserRoleEnum.VENDOR })
      .andWhere('user.is_deleted = false');

    if (is_verified) {
      query.andWhere('vendorInfo.validationCode IS NOT NULL');
    } else {
      query.andWhere('vendorInfo.validationCode IS NULL');
    }

    if (name) {
      query.andWhere('LOWER(user.user_name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    const totalCount = await query.getCount();

    const unverifiedVendors = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    if (!unverifiedVendors.length) {
      throw new NotFoundException('No vendor found.');
    }

    const vendors = await Promise.all(
      unverifiedVendors.map(async (vendor) => {
        const vendorDetails = await this.findUserById(vendor.id);
        return {
          id: vendorDetails.id,
          vendor_name: vendorDetails.vendor_name,
          email: vendorDetails.email,
          role: vendorDetails.role,
          country: vendorDetails.country.name,
          verification_status: vendorDetails.validation_code ? 'Verified' : 'Unverified',
          validation_code: vendorDetails.validation_code?.code || null,
        };
      })
    );

    return {
      is_verified: is_verified,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: vendors ? vendors : "Vendor not found",
    };
  }


  async findAllUsers(
    user: User,
    { page = 1, limit = 10, name }: { page?: number; limit?: number; name?: string }
  ): Promise<any> {

    checkIsAdmin(user, 'Only an admin can access this data')


    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userProfile', 'userProfile')
      .where('user.role = :role', { role: UserRoleEnum.USER })
      .andWhere('user.is_deleted = false');

    if (name) {
      query.andWhere('LOWER(user.user_name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    const totalCount = await query.getCount();

    const users = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    if (!users.length) {
      throw new NotFoundException('No user found.');
    }

    const userDetails = await Promise.all(
      users.map(user => this.findUserById(user.id))
    );

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: userDetails ? userDetails : "User not found",
    };
  }



  async findUserById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: id, is_deleted: false },
      relations: [
        'userProfile',
        'vendorInfo',
        'country',
        'userProfile.attachment',
        'vendorInfo.attachment',
        'vendorInfo.validationCode',
        'subscriptionStatus',
        'subscriptionStatus.subscriptionPlan',
        'subscriptionStatus.subscriptionPlan.subscriptionPlanFeatures'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;

    if (result.vendorInfo) {

      return {
        id: result.id,
        vendor_name: result.user_name,
        email: result.email,
        role: result.role,
        primary_content: result.vendorInfo.primary_content,
        phone: result.vendorInfo.phone,
        about_brand: result.vendorInfo.about_brand,
        website_url: result.vendorInfo.website_url ? result.vendorInfo.website_url : null,
        social_media: result.vendorInfo.social_media ? result.vendorInfo.social_media : null,
        other_links: result.vendorInfo.other_links ? result.vendorInfo.other_links : null,

        vendor_logo: result.vendorInfo.attachment ? {
          id: result.vendorInfo.attachment?.id,
          url: result.vendorInfo.attachment?.url,
          type: result.vendorInfo.attachment?.file_type
        } : null,
        validation_code: result.vendorInfo.validationCode ? {
          id: result.vendorInfo.validationCode?.id,
          code: result.vendorInfo.validationCode?.code,
          is_used: result.vendorInfo.validationCode?.is_used,
        } : null,
        country: result.country ? {
          id: result.country?.id,
          name: result.country?.name,
          code: result.country?.code
        } : null,
        subscriptionStatus: result.subscriptionStatus ? {
          id: result.subscriptionStatus.id,
          remaining_certificates: result.subscriptionStatus.remaining_certificates,
          total_certificates_issued: result.subscriptionStatus.total_certificates_issued,
          additional_feature_status: result.subscriptionStatus.additional_feature_status,
          is_expired: result.subscriptionStatus.is_expired,
          plan_activated_date: result.subscriptionStatus.plan_activated_date,
          plan_expiry_date: result.subscriptionStatus.plan_expiry_date,
          subscriptionPlan: result.subscriptionStatus?.subscriptionPlan ? {
            id: result.subscriptionStatus?.subscriptionPlan?.id,
            name: result.subscriptionStatus?.subscriptionPlan?.name,
            price: result.subscriptionStatus?.subscriptionPlan?.price,
            billingCycle: result.subscriptionStatus?.subscriptionPlan?.billingCycle,
            description: result.subscriptionStatus?.subscriptionPlan?.description,
            subscriptionPlanFeatures: result.subscriptionStatus.subscriptionPlan.subscriptionPlanFeatures.map(feature => ({
              id: feature.id,
              name: feature.name,
              description: feature.description,
              value: feature.value,
              additional_cost: feature.additional_cost
            }))
          } : null
        } : null
      };
    } else if (result.userProfile) {
      return {
        id: result.id,
        user_name: result.user_name,
        email: result.email,
        role: result.role,
        date_of_birth: result.userProfile.date_of_birth,
        phone: result.userProfile.phone,
        profile_image: result.userProfile.attachment ? {
          id: result.userProfile.attachment?.id,
          is_email_verified: result.userProfile.is_verified_email,
          url: result.userProfile.attachment?.url,
          type: result.userProfile.attachment?.file_type
        } : null,
        country: result.country ? {
          id: result.country?.id,
          name: result.country?.name,
          code: result.country?.code
        } : null
      };
    }
    else {
      return {
        id: result.id,
        user_name: result.user_name,
        email: result.email,
        role: result.role,
        country: {
          id: result.country?.id,
          name: result.country?.name,
          code: result.country?.code
        }
      };
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email, is_deleted: false },
      relations: ['userProfile', 'vendorInfo', 'country'],
    });
  }

  async findUserByIdWithAttachments(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['userProfile', 'vendorInfo', 'userProfile.attachment', 'vendorInfo.attachment', 'vendorInfo.validationCode', 'country'],
    });
  }


  async activateAccount(token: string): Promise<void> {

    const { email } = this.jwtService.verify(token);
    const user = await this.userRepository.findOne({
        where: { email },
        relations: ['userProfile', 'vendorInfo']
    });

    if (!user) {
        throw new BadRequestException('Invalid token or user not found');
    }

    if (user.role === UserRoleEnum.USER) {
        const isUserProfile = user.userProfile;

        if (!isUserProfile) {
            throw new BadRequestException('User profile not found');
        }

        isUserProfile.is_verified_email = true;
        await this.userProfileRepository.save(isUserProfile);
    } 
    if (user.role === UserRoleEnum.VENDOR) {
        const isVendorInfo = user.vendorInfo;

        if (!isVendorInfo) {
            throw new BadRequestException('Vendor info not found');
        }

        isVendorInfo.is_verified_email = true;
        await this.vendorInfoRepository.save(isVendorInfo);
    }
}

  async resendVerificationEmail(user: User): Promise<void> {
    const isUser = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['userProfile', 'vendorInfo']
    });

    if (!isUser.role) {
      throw new NotFoundException('User not found');
    }

    if ((isUser.role === UserRoleEnum.USER) && isUser.userProfile.is_verified_email) {
      throw new BadRequestException('Email is already verified');
    }
    if ((isUser.role === UserRoleEnum.VENDOR) && isUser.vendorInfo.is_verified_email) {
      throw new BadRequestException('Email is already verified');
    }
    const token = this.jwtService.sign({ email: isUser.email });
    await this.mailService.sendActivationEmail(isUser.email, token);
  }

}