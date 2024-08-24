// src/modules/subscription-plan/entities/subscription-plan.entity.ts
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SubscriptionPlanFeature } from './subscription-plan-feature.entity';
import { SubscriptionStatus } from './subscription-status.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
@Entity()
  export class SubscriptionPlan extends DefaultEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  billingCycle: string;

  @Column()
  description: string;

  @OneToMany(() => SubscriptionPlanFeature, feature => feature.subscriptionPlan, { cascade: true })
  subscriptionPlanFeatures: SubscriptionPlanFeature[];
  
  @OneToMany(() => SubscriptionStatus, subscriptionStatus => subscriptionStatus.subscriptionPlan)
  subscriptionStatus: SubscriptionStatus[];
}