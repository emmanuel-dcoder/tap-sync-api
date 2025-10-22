import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import { TransactionService } from 'src/transaction/services/transaction.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { envConfig } from 'src/core/config/env.config';

@Injectable()
export class PaymentService {
  constructor(private readonly transactionService: TransactionService) {}

  async initializePayment(payload: CreatePaymentDto) {
    const { userId, email, amount, duration, numberOfCards, paymentType } =
      payload;

    if (paymentType === 'card' && !numberOfCards)
      throw new BadRequestException(
        'number field cannot be empty for card payment type',
      );

    if (paymentType === 'subscription' && !duration)
      throw new BadRequestException(
        'duration field cannot be empty for subscription payment type',
      );

    const reference = `TX-${Date.now()}`;
    const totalAmount =
      paymentType === 'card' ? numberOfCards * amount : amount;
    try {
      const response = await axios.post(
        `${envConfig.paystack.url}/transaction/initialize`,
        {
          email,
          amount: totalAmount * 100,
          reference,
        },
        {
          headers: {
            Authorization: `Bearer ${envConfig.paystack.key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      await this.transactionService.createTransaction({
        userId,
        reference,
        amount: totalAmount,
        duration,
        paymentType,
        numberOfCards,
      });

      return response.data.data;
    } catch (error) {
      throw new HttpException(error.response.data, HttpStatus.BAD_REQUEST);
    }
  }

  async verifyWebhook(payload: any, signature: string) {
    const secretKey = envConfig.paystack.key;
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    if (payload.event === 'charge.success') {
      const { reference } = payload.data;
      const transaction = await this.transactionService.updateTransactionStatus(
        reference,
        'success',
      );
      return transaction;
    }
  }
}
