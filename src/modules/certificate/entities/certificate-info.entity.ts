import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { Certificate } from './certificate.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class CertificateInfo extends DefaultEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  font: string;

  @Column({ nullable: true })
  font_color: string;

  @Column({ nullable: true })
  bg_color: string;

  @Column({ nullable: true, default: 0 })
  issued: number;

  @Column({ type: 'timestamp' , nullable: true})
  issued_date: Date;

  @Column({ nullable: true })
  product_sell: string;

  @Column({ nullable: true, default: false })
  saved_draft: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_vendor' })
  created_by_vendor: User;

  @ManyToOne(() => Attachment, { nullable: true })
  @JoinColumn({ name: 'product_image' })
  product_image: Attachment;

  @ManyToOne(() => Attachment, { nullable: true })
  @JoinColumn({ name: 'custom_bg' })
  custom_bg: Attachment;

  @OneToMany(() => Certificate, (certificate) => certificate.certificateInfo)
  certificates: Certificate[];
}
