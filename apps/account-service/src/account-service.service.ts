import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VirtualAccount } from './entities/virtual-account.entity';
import { randomBytes } from 'crypto';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AccountTier } from '@libs/common';

@Injectable()
export class AccountServiceService {
  constructor(
    @InjectRepository(VirtualAccount)
    private readonly accountRepository: Repository<VirtualAccount>,
    @Inject('ACCOUNT') 
    private readonly nmqClient: ClientProxy,
  ) {}

  async createAccount(userId: string, currency: string = 'NGN', tier: AccountTier = AccountTier.TIER_1): Promise<VirtualAccount> {
    const accountNumber = this.generateAccountNumber();
    
    const account = this.accountRepository.create({
      userId,
      accountNumber,
      currency,
      balance: 0,
      tier,
    });

    const savedAccount = await this.accountRepository.save(account);
    
    this.nmqClient.emit('account_created', {
      ...savedAccount,
    });
    
    return savedAccount;
  }

  async getAccount(id: string): Promise<VirtualAccount> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    return account;
  }

  async updateTier(id: string, tier: AccountTier): Promise<VirtualAccount> {
    const account = await this.getAccount(id);
    account.tier = tier;
    return this.accountRepository.save(account);
  }

  async getAccountByNumber(accountNumber: string): Promise<VirtualAccount> {
    const account = await this.accountRepository.findOne({ where: { accountNumber } });
    if (!account) {
      throw new NotFoundException(`Account with account number ${accountNumber} not found`);
    }
    return account;
  }

  private generateAccountNumber(): string {
    // Basic account number generation logic (usually provided by a banking partner)
    return '00' + randomBytes(4).readUInt32BE(0).toString().substring(0, 8);
  }
}
