// src/seeds/subscription-plan.seeder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlanFeature } from 'src/modules/subscription/entities/subscription-plan-feature.entity';
import { SubscriptionPlan } from 'src/modules/subscription/entities/subscription-plan.entity';
import { Repository } from 'typeorm';
@Injectable()
export class SubscriptionPlanSeederService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionPlanFeature)
    private readonly subscriptionPlanFeatureRepository: Repository<SubscriptionPlanFeature>,
  ) {}
  async seed() {
    await this.seedStarterPlan();
    await this.seedStandardPlan();
    await this.seedProPlan();
    console.log('Seeding subscription plans completed');
  }
  private async seedStarterPlan() {
    const starterPlan = this.subscriptionPlanRepository.create({
      name: 'Starter',
      price: 0,
      billingCycle: 'No need',
      description: 'Basic features for small businesses',
    });
    await this.subscriptionPlanRepository.save(starterPlan);
    const starterFeatures = [
      this.subscriptionPlanFeatureRepository.create({
        name: 'Free Monthly Certificates',
        description:
          '50 Free Monthly Certificates to be used within the subscription period.',
        value: '50',
        subscriptionPlan: starterPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'No Credit Card information required',
        description: 'No Credit Card information required for sign up.',
        value: null,
        subscriptionPlan: starterPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'Upgrade any time',
        description: 'Upgrade your plan at any time to access more features.',
        value: null,
        subscriptionPlan: starterPlan,
      }),
    ];
    await this.subscriptionPlanFeatureRepository.save(starterFeatures);
  }
  private async seedStandardPlan() {
    const standardPlan = this.subscriptionPlanRepository.create({
      name: 'Standard',
      price: 30,
      billingCycle: 'Monthly',
      description: 'Most Popular',
    });
    await this.subscriptionPlanRepository.save(standardPlan);
    const standardFeatures = [
      this.subscriptionPlanFeatureRepository.create({
        name: 'Free Monthly Certificates',
        description:
          '100 Free Monthly Certificates to be used within the subscription period. These certificates can be customized and issued to students or participants.',
        value: '100',
        subscriptionPlan: standardPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'Total Certificates value, 10 cents per additional cartificate',
        description:
          '400 Total Certificates value, 10 cents per additional certificate.',
        value: '400',
        additional_cost: 0.1,
        subscriptionPlan: standardPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'sign up goes towards certificate credit',
        description: '$30 sign up goes towards certificate credit.',
        value: '$30',
        subscriptionPlan: standardPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'Customize Certificates*',
        description:
          'Customize Certificates by choosing fonts and certificate colors.',
        value: null,
        subscriptionPlan: standardPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'Upgrade any time',
        description: 'Upgrade your plan at any time to access more features.',
        value: null,
        subscriptionPlan: standardPlan,
      }),
    ];
    await this.subscriptionPlanFeatureRepository.save(standardFeatures);
  }
  private async seedProPlan() {
    const proPlan = this.subscriptionPlanRepository.create({
      name: 'Pro',
      price: 100,
      billingCycle: 'Monthly',
      description: 'Complete Certificate customization',
    });
    await this.subscriptionPlanRepository.save(proPlan);
    const proFeatures = [
      this.subscriptionPlanFeatureRepository.create({
        name: 'Free Monthly Certificates',
        description:
          '500 Free Monthly Certificates to be used within the subscription period. These certificates can be customized and issued to students or participants.',
        value: '500',
        subscriptionPlan: proPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'cents per certificate after first 500',
        description:
          'An additional cost of 5 cents per certificate applies after the first 500 certificates have been issued in a month.',
        value: '5',
        additional_cost: 0.05,
        subscriptionPlan: proPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'sign up goes towards certificate credit',
        description: '$100 sign up goes towards certificate credit.',
        value: '$100',
        subscriptionPlan: proPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'Access to beta programs',
        description:
          'Get access to our exclusive beta programs and try out new features before they are released to the public.',
        value: null,
        subscriptionPlan: proPlan,
      }),
      this.subscriptionPlanFeatureRepository.create({
        name: 'Complete Certificate customization*',
        description:
          'Complete Certificate customization allowing you to design certificates with your branding and specific details, including choosing fonts, certificate colors, and certificate frames, as well as setting a custom image background.',
        value: null,
        subscriptionPlan: proPlan,
      }),
    ];
    await this.subscriptionPlanFeatureRepository.save(proFeatures);
  }
}