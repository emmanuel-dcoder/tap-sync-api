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
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { NotificationService } from 'src/notification/services/notification.service';
import { MailService } from 'src/core/mail/email';
@Injectable()
export class PaymentService {
  constructor(
    private readonly transactionService: TransactionService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}

  async initializePayment(payload: CreatePaymentDto & { userId: string }) {
    const { userId, duration, numberOfCards, paymentType } = payload;

    if (paymentType === 'card' && !numberOfCards)
      throw new BadRequestException(
        'number field cannot be empty for card payment type',
      );

    if (paymentType === 'subscription' && !duration)
      throw new BadRequestException(
        'duration field cannot be empty for subscription payment type',
      );

    const user = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) throw new BadRequestException('Invalid User');

    const amount = paymentType === 'card' ? 4000 : 10000;
    const reference = `TX-${Date.now()}`;
    const totalAmount =
      paymentType === 'card' ? numberOfCards * amount : amount;
    try {
      const response = await axios.post(
        `${envConfig.paystack.url}/transaction/initialize`,
        {
          email: user.email,
          amount: totalAmount * 100,
          reference,
          callback_url: `https://tapsync-userdashboard.vercel.app/payment-callback`,
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
      let user = await this.userModel.findOne({ _id: transaction.userId });

      if (transaction.paymentType === 'subscription') {
        await this.userModel.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(transaction.userId),
          },
          { isSubscribe: true },
        );
      }
      try {
        await this.notificationService.create({
          title: 'Tapsync: Payment Verfication 💰💰',
          body: `Your payment for ${transaction.paymentType} is successful 👍👍`,
          userType: 'User',
          user: `${transaction.userId}`,
        });

        await this.mailService.sendMailNotification(
          user.email,
          'Tapsync: Payment Verfication 💰💰',
          {
            message: `Your payment for ${transaction.paymentType} is successful 👍👍`,
          },
          'payment',
        );
      } catch (error) {
        console.log('notfication error', error);
      }

      return transaction;
    }
  }

  async getTransactionByReference(reference: string) {
    const transaction =
      await this.transactionService.findByReference(reference);

    if (!transaction) {
      throw new BadRequestException(
        'Transaction not found or invalid reference',
      );
    }

    return transaction;
  }
}
