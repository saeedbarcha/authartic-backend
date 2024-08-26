import { Entity, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { VendorInfo } from './vendor-info.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { Country } from 'src/modules/country/entities/country.entity';
import { CertificateInfo } from 'src/modules/certificate/entities/certificate-info.entity';
import { SubscriptionStatus } from 'src/modules/subscription/entities/subscription-status.entity';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';


@Entity()
export class User extends DefaultEntity {
    @Column({ nullable: true })
    user_name: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({
        type: "enum",
        enum: UserRoleEnum,
        default: UserRoleEnum.USER
    })
    role: UserRoleEnum;

    @ManyToOne(() => Country, country => country.users, { nullable: true })
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @OneToOne(() => UserProfile, userProfile => userProfile.user, { nullable: true })
    @JoinColumn({ name: 'user_profile_id' })
    userProfile: UserProfile;

    @OneToOne(() => VendorInfo, vendorInfo => vendorInfo.user, { nullable: true })
    @JoinColumn({ name: 'vendor_info_id' })
    vendorInfo: VendorInfo;

    @OneToMany(() => CertificateInfo, (certificateInfo) => certificateInfo.created_by_vendor)
    createdCertificates: CertificateInfo[];

    @OneToOne(() => SubscriptionStatus, subscriptionStatus => subscriptionStatus.user )
    @JoinColumn({ name: 'subscription_status_id' })
    subscriptionStatus: SubscriptionStatus;

}
