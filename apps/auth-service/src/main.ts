import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { RmqService } from '@libs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('AUTH'));
  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
