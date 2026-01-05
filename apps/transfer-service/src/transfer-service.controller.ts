import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TransferServiceService } from './transfer-service.service';

@Controller('transfers')
export class TransferServiceController {
  constructor(private readonly transferService: TransferServiceService) {}

  @Post()
  async transferFunds(
    @Body()
    data: {
      senderAccountNumber: string;
      receiverAccountNumber: string;
      amount: number;
      reference: string;
    },
  ) {
    return this.transferService.transferFunds(data);
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    return this.transferService.getTransaction(id);
  }
}
