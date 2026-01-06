import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationServiceService } from './notification-service.service';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationService: NotificationServiceService) {}

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: { userId: string, email: string }) {
    await this.notificationService.createNotification({
      userId: data.userId,
      title: 'Welcome to Banking System!',
      message: `Hi ${data.email}, your account has been successfully created.`,
      type: 'USER_ACTIVITY',
    });
  }

  @EventPattern('account_created')
  async handleAccountCreated(@Payload() data: { userId: string, accountNumber: string }) {
    await this.notificationService.createNotification({
      userId: data.userId,
      title: 'Virtual Account Generated',
      message: `Your virtual account ${data.accountNumber} is ready for use.`,
      type: 'ACCOUNT',
    });
  }

  @EventPattern('transfer_completed')
  async handleTransferCompleted(@Payload() data: any) {
    // Notify Sender
    await this.notificationService.createNotification({
      userId: data.senderUserId,
      title: 'Transfer Successful',
      message: `Your transfer of ${data.amount} ${data.currency} to ${data.receiverAccountNumber} was successful.`,
      type: 'TRANSACTION',
    });

    // Notify Receiver
    await this.notificationService.createNotification({
      userId: data.receiverUserId,
      title: 'Credit Alert',
      message: `Your account has been credited with ${data.amount} ${data.currency} from ${data.senderAccountNumber}.`,
      type: 'TRANSACTION',
    });
  }
}
