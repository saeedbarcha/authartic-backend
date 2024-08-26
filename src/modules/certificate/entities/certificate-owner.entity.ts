import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { Certificate } from './certificate.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class CertificateOwner extends DefaultEntity {

@Column({ nullable: true, default: false })
is_owner: boolean;

@ManyToOne(() => Certificate, (certificate) => certificate.id)
@JoinColumn({ name: 'certificate_id' })
certificate: Certificate;

@ManyToOne(() => User, (user) => user.id)
@JoinColumn({ name: 'owner_id' })
user: User;

}