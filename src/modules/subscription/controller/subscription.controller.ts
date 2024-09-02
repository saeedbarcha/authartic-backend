import { Controller, Get, Post, UseGuards, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from '../dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from '../dto/update-subscription-plan.dto';
import { GetUser } from '../../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionStatusService } from '../services/Subscription-status.service';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { User } from 'src/modules/user/entities/user.entity';

@Controller('subscription-plan')
export class SubscriptionController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly subscriptionStatusService: SubscriptionStatusService


  ) { }

  @Post()
  create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(createSubscriptionPlanDto);
  }

  @Get('all')
  findAll() {
    return this.subscriptionPlanService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.subscriptionPlanService.findOneById(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('activate-plan/:id')
  activatePlan(@Param('id') id: string, @GetUser() user: User) {
    const planId = parseInt(id, 10);

    if (isNaN(planId)) {
      throw new BadRequestException('Invalid plan ID.');
    }
    // return this.subscriptionPlanService.activatePlan(planId, user);
    return this.subscriptionStatusService.activatePlan(planId, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
  //   return this.subscriptionPlanService.update(+id, updateSubscriptionPlanDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.subscriptionPlanService.remove(+id);
  // }
}
