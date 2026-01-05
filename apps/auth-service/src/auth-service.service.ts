import { Injectable, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('AUTH')
    private readonly rmqClient: ClientProxy,
  ) {}

  async register(data: any): Promise<any> {
    const { email, password, firstName, lastName, idType, idNumber } = data;

    if (!idType || !idNumber) {
      throw new BadRequestException('ID Type and ID Number are required for KYC verification');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // IDENTITY VERIFICATION MOCK
    const isVerified = await this.verifyIdentity(idType, idNumber);
    if (!isVerified) {
      throw new BadRequestException('Identity verification failed. Please provide valid ID details.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      idType,
      idNumber,
      isVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Emit event for other services (e.g. account-service to create a virtual account)
    this.rmqClient.emit('user_created', {
      userId: savedUser.id,
      email: savedUser.email,
    });

    const { password: _, ...result } = savedUser;
    return result;
  }

  private async verifyIdentity(idType: string, idNumber: string): Promise<boolean> {
    console.log(`Verifying ${idType}: ${idNumber}...`);
    // Simple mock logic: fail if ID number starts with '000'
    if (idNumber.startsWith('000')) {
      return false;
    }
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }
}
