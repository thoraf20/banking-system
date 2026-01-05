import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountServiceController } from './account-service.controller';
import { AccountServiceService } from './account-service.service';
import { VirtualAccount } from './entities/virtual-account.entity';
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
      entities: [VirtualAccount],
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
    }),
    TypeOrmModule.forFeature([VirtualAccount]),
    RmqModule.register({ name: 'ACCOUNT' }),
  ],
  controllers: [AccountServiceController],
  providers: [AccountServiceService],
})
export class AccountServiceModule {}
