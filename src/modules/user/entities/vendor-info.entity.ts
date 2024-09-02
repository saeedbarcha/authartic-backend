import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { User } from './user.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { ValidationCode } from 'src/modules/validation-code/entities/validation-code.entity';



@Entity()
export class VendorInfo extends DefaultEntity {

    @Column({ default: false })
    is_verified_email: boolean;
    
    @Column({ nullable: true })
    primary_content: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    about_brand: string;
    
    @Column({ nullable: true })
    otp: string;

    @Column({ nullable: true })
    website_url: string;

    @Column('simple-array', { nullable: true })
    social_media: string[];

    @Column('simple-array', { nullable: true })
    other_links: string[];

    @OneToOne(() => User, user => user.subscriptionStatus)
    @JoinColumn({ name: 'user' })
    user: User;

    @OneToOne(() => Attachment, { nullable: true })
    @JoinColumn({ name: 'attachment_id' })
    attachment: Attachment;

    @OneToOne(() => ValidationCode, validationCode => validationCode.vendorInfo, { nullable: true })
    @JoinColumn({ name: 'validation_code_id' })
    validationCode: ValidationCode;

    

}
