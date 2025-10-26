import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import {
  Transaction,
  TransactionSchema,
} from 'src/transaction/schemas/transaction.schema';
import { TransactionService } from 'src/transaction/services/transaction.service';
import { OrderService } from 'src/order/services/order.service';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { NotificationService } from 'src/notification/services/notification.service';
import { MailService } from 'src/core/mail/email';
import {
  NotificationSchema,
  Notification,
} from 'src/notification/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    TransactionService,
    OrderService,
    NotificationService,
    MailService,
  ],
})
export class PaymentModule {}
