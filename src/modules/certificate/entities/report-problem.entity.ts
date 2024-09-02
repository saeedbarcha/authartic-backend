// src/modules/report-problem/entities/report-problem.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { CertificateInfo } from 'src/modules/certificate/entities/certificate-info.entity';
import { ReportProblemStatusEnum } from 'src/modules/common/report-problem-status.enum';
import { User } from 'src/modules/user/entities/user.entity';


@Entity()
export class ReportProblem extends DefaultEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  @Column({ type: 'timestamp', nullable: false })
  reporting_date: Date;

  @Column({ type: 'text', nullable: false })
  reporting_text: string;

  @ManyToOne(() => CertificateInfo, { nullable: false })
  @JoinColumn({ name: 'certificate_info_id' })
  certificate_info: CertificateInfo;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column({ type: 'timestamp', nullable: true })
  response_date: Date;

  @Column({ type: 'text', nullable: true })
  response_text: string;

  @Column({
    type: 'enum',
    enum: ReportProblemStatusEnum,
    default: ReportProblemStatusEnum.OPEN,
    name: 'report_status',
  })
  report_status: ReportProblemStatusEnum;
}
