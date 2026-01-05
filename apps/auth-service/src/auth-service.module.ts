import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { User } from './entities/user.entity';
import { RmqModule } from '@libs/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'banking_auth',
      entities: [User],
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
    }),
    TypeOrmModule.forFeature([User]),
    RmqModule.register({ name: 'AUTH' }),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
