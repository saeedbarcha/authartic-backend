import { Entity, Column, ManyToOne } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

@Entity()
export class SubscriptionPlanFeature extends DefaultEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({  nullable: true })
  value: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  additional_cost: number | null; // Allow null values if applicable
  

  @ManyToOne(() => SubscriptionPlan, subscriptionPlan => subscriptionPlan.subscriptionPlanFeatures)
  subscriptionPlan: SubscriptionPlan;
}