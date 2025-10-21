import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { envConfig } from './core/config/env.config';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { TapsModule } from './taps/taps.module';
import { UserDashboardModule } from './user-dashboard/dashboard.module';
import { StaffModule } from './staff/staff.module';
import { TicketModule } from './ticket/ticket.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    MongooseModule.forRoot(envConfig.database.mongo_url),
    AdminModule,
    UserModule,
    TapsModule,
    UserDashboardModule,
    StaffModule,
    TicketModule,
    NotificationModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
