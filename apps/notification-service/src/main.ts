import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { RmqService } from '@libs/common';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  
  // Setup Redis IO Adapter for WebSockets
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('NOTIFICATION'));
  
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log(`Notification Service is running on: ${await app.getUrl()}`);
}
bootstrap();
