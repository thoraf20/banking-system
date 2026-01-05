import { Injectable, BadRequestException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { VirtualAccount } from '../../account-service/src/entities/virtual-account.entity';
import { TierLimits } from '@libs/common';

@Injectable()
export class TransferServiceService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(VirtualAccount)
    private readonly accountRepository: Repository<VirtualAccount>,
    private readonly dataSource: DataSource,
    @Inject('TRANSFER') private readonly nmqClient: ClientProxy,
  ) {}

  async transferFunds(data: {
    senderAccountNumber: string;
    receiverAccountNumber: string;
    amount: number;
    reference: string;
  }): Promise<Transaction> {

    const existingTx = await this.transactionRepository.findOne({
      where: { reference: data.reference },
    });
    if (existingTx) {
      return existingTx;
    }

    if (data.senderAccountNumber === data.receiverAccountNumber) {
      throw new BadRequestException('Sender and receiver accounts cannot be the same');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sender = await queryRunner.manager.findOne(VirtualAccount, {
        where: { accountNumber: data.senderAccountNumber },
        lock: { mode: 'pessimistic_write' },
      });

      const receiver = await queryRunner.manager.findOne(VirtualAccount, {
        where: { accountNumber: data.receiverAccountNumber },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sender || !receiver) {
        throw new BadRequestException('One or both accounts not found');
      }

      if (Number(sender.balance) < data.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const senderLimits = TierLimits[sender.tier];
      if (data.amount > senderLimits.singleTransactionLimit) {
        throw new BadRequestException(`Transfer amount exceeds the single transaction limit for your tier (${sender.tier})`);
      }

      const receiverLimits = TierLimits[receiver.tier];
      const newReceiverBalance = Number(receiver.balance) + data.amount;
      if (newReceiverBalance > receiverLimits.maxBalance) {
        throw new BadRequestException(`Receiver account balance would exceed the maximum limit for their tier (${receiver.tier})`);
      }

      sender.balance = Number(sender.balance) - data.amount;
      receiver.balance = newReceiverBalance;

      await queryRunner.manager.save(sender);
      await queryRunner.manager.save(receiver);

      const transaction = queryRunner.manager.create(Transaction, {
        ...data,
        status: TransactionStatus.COMPLETED,
      });

      const savedTx = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      
      this.nmqClient.emit('transfer_completed', savedTx);
      
      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }
}
