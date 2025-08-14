import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription } from './push-subscription.entity';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';

@Injectable()
export class PushSubscriptionsService {
  constructor(
    @InjectRepository(PushSubscription)
    private pushSubscriptionsRepository: Repository<PushSubscription>,
  ) {}

  async create(
    userId: number,
    createPushSubscriptionDto: CreatePushSubscriptionDto,
  ): Promise<PushSubscription> {
    // Check if subscription already exists for this endpoint
    const existingSubscription = await this.pushSubscriptionsRepository.findOne({
      where: { endpoint: createPushSubscriptionDto.endpoint },
    });

    if (existingSubscription) {
      if (existingSubscription.userId === userId) {
        // Update existing subscription
        Object.assign(existingSubscription, createPushSubscriptionDto);
        return this.pushSubscriptionsRepository.save(existingSubscription);
      } else {
        throw new ConflictException('Endpoint already registered by another user');
      }
    }

    const subscription = this.pushSubscriptionsRepository.create({
      ...createPushSubscriptionDto,
      userId,
    });

    return this.pushSubscriptionsRepository.save(subscription);
  }

  async findAll(userId: number): Promise<PushSubscription[]> {
    return this.pushSubscriptionsRepository.find({
      where: { userId, isActive: true },
    });
  }

  async findOne(id: number, userId: number): Promise<PushSubscription> {
    const subscription = await this.pushSubscriptionsRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Push subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async update(
    id: number,
    userId: number,
    updateData: Partial<CreatePushSubscriptionDto>,
  ): Promise<PushSubscription> {
    const subscription = await this.findOne(id, userId);
    Object.assign(subscription, updateData);
    return this.pushSubscriptionsRepository.save(subscription);
  }

  async updatePreferences(
    id: number,
    userId: number,
    preferences: any,
  ): Promise<PushSubscription> {
    const subscription = await this.findOne(id, userId);
    subscription.preferences = { ...subscription.preferences, ...preferences };
    return this.pushSubscriptionsRepository.save(subscription);
  }

  async deactivate(id: number, userId: number): Promise<void> {
    const subscription = await this.findOne(id, userId);
    subscription.isActive = false;
    await this.pushSubscriptionsRepository.save(subscription);
  }

  async remove(id: number, userId: number): Promise<void> {
    const subscription = await this.findOne(id, userId);
    await this.pushSubscriptionsRepository.remove(subscription);
  }

  async removeByEndpoint(endpoint: string, userId: number): Promise<void> {
    const subscription = await this.pushSubscriptionsRepository.findOne({
      where: { endpoint, userId },
    });

    if (subscription) {
      await this.pushSubscriptionsRepository.remove(subscription);
    }
  }

  async getActiveSubscriptions(userId: number): Promise<PushSubscription[]> {
    return this.pushSubscriptionsRepository.find({
      where: { userId, isActive: true },
    });
  }

  async getSubscriptionCount(userId: number): Promise<number> {
    return this.pushSubscriptionsRepository.count({
      where: { userId, isActive: true },
    });
  }
}
