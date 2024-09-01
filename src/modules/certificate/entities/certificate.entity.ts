import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { CertificateInfo } from './certificate-info.entity';
import { CertificateOwner } from './certificate-owner.entity';

@Entity()
export class Certificate extends DefaultEntity {

    @Column({ type: 'varchar', length: 255, nullable: false })
    serial_number: string;

    @Column({ nullable: true })
    qr_code: string;

    @ManyToOne(() => CertificateInfo, (certificateInfo) => certificateInfo.certificates, { nullable: false })
    @JoinColumn({ name: 'certificate_info_id' })
    certificateInfo: CertificateInfo;

    @OneToMany(() => CertificateOwner, (certificateOwner) => certificateOwner.certificate)
    owners: CertificateOwner[];
}
