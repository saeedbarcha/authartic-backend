import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class SubscriptionStatus extends DefaultEntity {
    @Column({  default: 0 })
    total_certificates_issued: number;

    @Column({  default: 0 })
    remaining_certificates: number;

    @Column({ type: 'timestamp' , nullable: false})
    plan_activated_date: Date;

    @Column({ type: 'timestamp', nullable: false  })
    plan_expiry_date: Date;

    @Column({ nullable: false  })
    is_expired: boolean;

    @Column({ type: 'json', nullable: true })
    additional_feature_status: Record<string, any>;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    additional_cost: number | null; 

    @ManyToOne(() => SubscriptionPlan, subscriptionPlan => subscriptionPlan.subscriptionStatus, { nullable: false })
    @JoinColumn({ name: 'subscription_plan_id' })
    subscriptionPlan: SubscriptionPlan;

    @OneToOne(() => User, user => user.subscriptionStatus, { cascade: true, nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;
}