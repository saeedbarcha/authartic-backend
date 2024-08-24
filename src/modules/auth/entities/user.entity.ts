import { Entity, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { UserRoleEnum } from '../enum/user.role.enum';
import { UserProfile } from './user-profile.entity';
import { VendorInfo } from './vendor-info.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { Country } from 'src/modules/country/entities/country.entity';
import { CertificateInfo } from 'src/modules/certificate/entities/certificate-info.entity';
import { SubscriptionStatus } from 'src/modules/subscription/entities/subscription-status.entity';




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

    @Column({ default: false })
    is_verified_email: boolean;

    @ManyToOne(() => Country, country => country.users, { nullable: true })
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @OneToOne(() => UserProfile, userProfile => userProfile.user, { nullable: true })
    userProfile: UserProfile;

    @OneToOne(() => VendorInfo, vendorInfo => vendorInfo.user, { nullable: true })
    vendorInfo: VendorInfo;

    @OneToMany(() => CertificateInfo, (certificateInfo) => certificateInfo.created_by_vendor)
    createdCertificates: CertificateInfo[];

    @OneToOne(() => SubscriptionStatus, subscriptionStatus => subscriptionStatus.user )
    @JoinColumn({ name: 'subscription_status_id' })
    subscriptionStatus: SubscriptionStatus;

}
