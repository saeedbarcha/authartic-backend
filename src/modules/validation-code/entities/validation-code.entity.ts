import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { VendorInfo } from 'src/modules/user/entities/vendor-info.entity';


@Entity()
export class ValidationCode extends DefaultEntity {
  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ nullable: true, type: 'boolean' })
  is_used: boolean;

  @OneToOne(() => VendorInfo, vendorInfo => vendorInfo.validationCode, { nullable: true })
  @JoinColumn({ name: 'vendor_info_id' })
  vendorInfo: VendorInfo;
}
