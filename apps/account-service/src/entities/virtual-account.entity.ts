import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AccountTier } from '@libs/common';

@Entity('virtual_accounts')
export class VirtualAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accountNumber: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  providerRef: string;

  @Column({ default: 'active' })
  status: string;

  @Column({
    type: 'enum',
    enum: AccountTier,
    default: AccountTier.TIER_1,
  })
  tier: AccountTier;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
