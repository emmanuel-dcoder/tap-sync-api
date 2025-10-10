import { Module } from '@nestjs/common';
import { TapsService } from './taps.service';
import { TapsController } from './taps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Taps, TapsSchema } from './schemas/taps.schema';
import { MailService } from 'src/core/mail/email';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Staff, StaffSchema } from 'src/staff/schemas/staff.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Taps.name, schema: TapsSchema },
      { name: User.name, schema: UserSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],
  controllers: [TapsController],
  providers: [TapsService, MailService],
})
export class TapsModule {}
