import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../../auth/entities/user.entity';
import { UserService } from '../../auth/service/user.service';
import { UserRoleEnum } from '../../auth/enum/user.role.enum';
import { SubscriptionStatus } from '../entities/subscription-status.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { SubscriptionPlanFeature } from '../entities/subscription-plan-feature.entity';
import { UpdateSubscriptionStatusDto } from '../dto/update-subscription-status.dto';
import { CreateSubscriptionStatusDto } from '../dto/create-subscription-status.dto';

@Injectable()
export class SubscriptionStatusService {
    constructor(
        @InjectRepository(SubscriptionStatus)
        private readonly subscriptionStatusRepository: Repository<SubscriptionStatus>,
        @InjectRepository(SubscriptionPlan)
        private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
        @InjectRepository(SubscriptionPlanFeature)
        private readonly subscriptionPlanFeatureRepository: Repository<SubscriptionPlanFeature>,
        private readonly userService: UserService,
        private readonly dataSource: DataSource,
    ) { }

    async activatePlan(subscriptionPlanId: number, user: User): Promise<any> {

    
        if (!subscriptionPlanId) {
            throw new BadRequestException('Subscription ID is required.');
        }
 

        if (!user) {
            throw new UnauthorizedException('User token is required.');
        }
     

        if (user.role !== UserRoleEnum.VENDOR) {
            throw new ForbiddenException('Only vendors can activate subscription plan.');
        }

   

        const subscriptionPlan = await this.subscriptionPlanRepository.findOne({
            where: { id: subscriptionPlanId },
            relations: ['subscriptionPlanFeatures'],
        });



        if (!subscriptionPlan) {
            throw new NotFoundException('Subscription plan not found.');
        }

    

        if (!subscriptionPlan.subscriptionPlanFeatures) {
            throw new NotFoundException('No subscription plan features found.');
        }

        const feature = subscriptionPlan.subscriptionPlanFeatures.find(
            feature => feature.name === 'Free Monthly Certificates'
        );

        if (!feature) {
            throw new NotFoundException('Feature "Free Monthly Certificates" not found.');
        }
       
        const numberOfCertificates = feature.value ? parseInt(feature.value, 10) : 0;

      
        
        const userDetails = await this.userService.findUserById(user.id);
      
        if (!userDetails.validation_code) {
            throw new NotFoundException('Your account is not verified.');
        }
     
        let subscriptionStatus = await this.subscriptionStatusRepository.findOne({
            where: { user: { id: user.id } },
        });

        const createSubscriptionStatusDto = new CreateSubscriptionStatusDto();
        createSubscriptionStatusDto.total_certificates_issued = (subscriptionStatus?.total_certificates_issued || 0);
        createSubscriptionStatusDto.remaining_certificates = numberOfCertificates;
        createSubscriptionStatusDto.plan_activated_date = new Date();
        createSubscriptionStatusDto.plan_expiry_date = new Date(new Date().setDate(new Date().getDate() + 30));
        createSubscriptionStatusDto.is_expired = createSubscriptionStatusDto.plan_expiry_date < new Date();
        createSubscriptionStatusDto.subscriptionPlan = subscriptionPlan;

        if (subscriptionStatus) {
            subscriptionStatus.total_certificates_issued = subscriptionStatus.total_certificates_issued;
            subscriptionStatus.remaining_certificates = numberOfCertificates;
            subscriptionStatus.plan_activated_date = new Date();
            subscriptionStatus.plan_expiry_date = new Date(new Date().setDate(new Date().getDate() + 30));
            subscriptionStatus.additional_cost = 0;
            subscriptionStatus.is_expired = false;
            subscriptionStatus.subscriptionPlan = subscriptionPlan;
            return this.subscriptionStatusRepository.save(subscriptionStatus);
        } else {
            subscriptionStatus = this.subscriptionStatusRepository.create({
                ...createSubscriptionStatusDto,
                user: userDetails,
            });

            await this.dataSource.transaction(async (entityManager: EntityManager) => {
                subscriptionStatus = await entityManager.save(SubscriptionStatus, subscriptionStatus);
                await entityManager.update(User, userDetails.id, {
                    subscriptionStatus: subscriptionStatus,
                });
                userDetails.subscriptionStatus = subscriptionStatus;
            });
        }

       
        return this.userService.findUserById(user.id);

    }

    async updateSubscriptionStatus(subscriptionStatusId: number, certificatesToIssue: number, updateSubscriptionStatusDto: UpdateSubscriptionStatusDto): Promise<SubscriptionStatus> {


        const subscriptionStatus = await this.subscriptionStatusRepository.findOne({
            where: { id: subscriptionStatusId },
        });

        if (!subscriptionStatus) {
            throw new NotFoundException('Subscription status not found.');
        }


        await this.isRemainingCertificates(subscriptionStatusId, certificatesToIssue);

        subscriptionStatus.total_certificates_issued = updateSubscriptionStatusDto.total_certificates_issued ?? subscriptionStatus.total_certificates_issued;
        subscriptionStatus.remaining_certificates = updateSubscriptionStatusDto.remaining_certificates ?? subscriptionStatus.remaining_certificates;
        subscriptionStatus.plan_activated_date = updateSubscriptionStatusDto.plan_activated_date ?? subscriptionStatus.plan_activated_date;
        subscriptionStatus.additional_feature_status = updateSubscriptionStatusDto.additional_feature_status ?? subscriptionStatus.additional_feature_status;
        subscriptionStatus.additional_cost = updateSubscriptionStatusDto.additional_cost ?? subscriptionStatus.additional_cost;
        subscriptionStatus.subscriptionPlan = updateSubscriptionStatusDto.subscriptionPlan ?? subscriptionStatus.subscriptionPlan;

        return this.subscriptionStatusRepository.save(subscriptionStatus);
    }

    async isRemainingCertificates(subscriptionStatusId: number, certificatesToIssue: number): Promise<any> {
        const subscriptionStatus = await this.subscriptionStatusRepository.findOne({
            where: { id: subscriptionStatusId },
        });

        if (!subscriptionStatus) {
            throw new NotFoundException('Subscription status not found.');
        }

        if (subscriptionStatus.remaining_certificates <= 0) {
            throw new BadRequestException('You don\'t have remaining certificates, save in draft or upgrade plan.');
        }

        const remainingCertificates = subscriptionStatus.remaining_certificates;

        if ((subscriptionStatus.remaining_certificates - certificatesToIssue) < 0) {
            throw new BadRequestException(`You have only ${remainingCertificates} certificate${remainingCertificates === 1 ? '' : 's'}.`);
        }

        subscriptionStatus.remaining_certificates -= certificatesToIssue;

        return await this.subscriptionStatusRepository.save(subscriptionStatus);
    }


    // @Cron('*/1 * * * *')
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        const now = new Date();
        const subscriptionStatuses = await this.subscriptionStatusRepository.find({
            where: {
                is_expired: false,
            },
        });

        if (subscriptionStatuses) {
            for (const status of subscriptionStatuses) {
                const planExpiryDate = new Date(status.plan_expiry_date);
                console.log(`Checking status ID: ${status.id}`);
                console.log('Plan expiry date:', planExpiryDate.toISOString());
                console.log('Is expired:', status.is_expired);

                if (planExpiryDate < now && !status.is_expired) {
                    status.is_expired = true;
                    try {
                        await this.subscriptionStatusRepository.save(status);
                    } catch (error) {
                        console.error(`Failed to update is_expired for status ID: ${status.id}:`, error);
                    }
                }
            }
        }



    }


}
