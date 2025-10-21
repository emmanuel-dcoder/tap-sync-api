import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { TransactionService } from 'src/transaction/services/transaction.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { envConfig } from 'src/core/config/env.config';

@Injectable()
export class PaymentService {
  constructor(private readonly transactionService: TransactionService) {}

  async initializePayment(payload: CreatePaymentDto) {
    const { userId, email, amount, duration } = payload;
    const reference = `TX-${Date.now()}`;

    try {
      const response = await axios.post(
        `${envConfig.paystack.url}/transaction/initialize`,
        {
          email,
          amount: amount * 100,
          reference,
          // callback_url: `${envConfig.paystack.key}/api/payment/verify`,
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
        amount,
        duration,
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
