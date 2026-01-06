import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class NotificationServiceService {
  private pubSub = new PubSub();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    const savedNotification = await this.notificationRepository.save(notification);
    
    // Broadcast notification to the specific user via GraphQL Subscription
    this.pubSub.publish('notificationAdded', {
      notificationAdded: savedNotification,
    });
    
    return savedNotification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (notification) {
      notification.isRead = true;
      return this.notificationRepository.save(notification);
    }
    return null;
  }

  getPubSub() {
    return this.pubSub;
  }
}
