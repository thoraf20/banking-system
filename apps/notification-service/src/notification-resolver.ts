import { Resolver, Query, Mutation, Subscription, Args } from '@nestjs/graphql';
import { NotificationServiceService } from './notification-service.service';
import { Notification } from './entities/notification.entity';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationServiceService) {}

  @Query(() => [Notification], { name: 'getNotifications' })
  async getNotifications(@Args('userId') userId: string) {
    return this.notificationService.getNotifications(userId);
  }

  @Mutation(() => Notification)
  async markAsRead(@Args('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Subscription(() => Notification, {
    filter: (payload, variables) => {
      return payload.notificationAdded.userId === variables.userId;
    },
  })
  notificationAdded(@Args('userId') userId: string) {
    return (this.notificationService.getPubSub() as any).asyncIterator('notificationAdded');
  }
}
