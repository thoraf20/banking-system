import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  message: string;

  @Field()
  @Column({ default: false })
  isRead: boolean;

  @Field()
  @Column({ nullable: true })
  type: string; // e.g., 'TRANSACTION', 'USER_ACTIVITY', 'ALERT'

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
