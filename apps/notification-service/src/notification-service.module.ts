import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { Notification } from './entities/notification.entity';
import { NotificationResolver } from './notification-resolver';
import { RmqModule } from '@libs/common';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME_NOTIFICATION || 'banking_notification',
      entities: [Notification],
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
    }),
    TypeOrmModule.forFeature([Notification]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/notification-service/schema.gql'),
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    RmqModule.register({ name: 'NOTIFICATION' }),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService, NotificationResolver],
})
export class NotificationServiceModule {}
