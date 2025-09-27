import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from 'src/core/mail/email';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { UserDashboardController } from './dashboard.controller';
import { UserDashboardService } from './dashboard.service';
import { Taps, TapsSchema } from 'src/taps/schemas/taps.schema';
import { Request, RequestSchema } from 'src/request/schemas/request.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Taps.name, schema: TapsSchema },
      { name: User.name, schema: UserSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
  ],
  controllers: [UserDashboardController],
  providers: [UserDashboardService, MailService],
})
export class UserDashboardModule {}
