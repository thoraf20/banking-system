import { NestFactory } from '@nestjs/core';
import { TransferServiceModule } from './transfer-service.module';
import { RmqService } from '@libs/common';

async function bootstrap() {
  const app = await NestFactory.create(TransferServiceModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('TRANSFER'));
  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();

