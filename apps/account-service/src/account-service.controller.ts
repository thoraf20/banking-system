import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AccountServiceService } from './account-service.service';
import { AccountTier } from '@libs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('accounts')
export class AccountServiceController {
  constructor(private readonly accountService: AccountServiceService) {}

  @Post()
  async createAccount(@Body() data: { userId: string, currency?: string, tier?: AccountTier }) {
    return this.accountService.createAccount(data.userId, data.currency, data.tier);
  }

  @Post(':id/tier')
  async updateTier(@Param('id') id: string, @Body('tier') tier: AccountTier) {
    return this.accountService.updateTier(id, tier);
  }

  @Get(':id')
  async getAccount(@Param('id') id: string) {
    return this.accountService.getAccount(id);
  }

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: { userId: string, email: string }) {
    console.log(`Creating default account for user: ${data.userId}`);
    await this.accountService.createAccount(data.userId);
  }
}
