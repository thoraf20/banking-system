import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferServiceController } from './transfer-service.controller';
import { TransferServiceService } from './transfer-service.service';
import { Transaction } from './entities/transaction.entity';
import { VirtualAccount } from '../../account-service/src/entities/virtual-account.entity';
import { RmqModule } from '@libs/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'banking_account',
      entities: [Transaction, VirtualAccount],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Transaction, VirtualAccount]),
    RmqModule.register({ name: 'TRANSFER' }),
  ],
  controllers: [TransferServiceController],
  providers: [TransferServiceService],
})
export class TransferServiceModule {}
