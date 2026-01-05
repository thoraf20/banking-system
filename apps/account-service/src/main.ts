import { NestFactory } from '@nestjs/core';
import { AccountServiceModule } from './account-service.module';
import { RmqService } from '@libs/common';

async function bootstrap() {
  const app = await NestFactory.create(AccountServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('ACCOUNT'));
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();

