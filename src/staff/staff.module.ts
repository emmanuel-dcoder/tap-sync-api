import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from 'src/core/mail/email';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Staff, StaffSchema } from './schemas/staff.schema';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { NotificationService } from 'src/notification/services/notification.service';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/schemas/notification.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { RequestSchema } from 'src/request/schemas/request.schema';
import { Message, MessageSchema } from 'src/message/schemas/message.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [StaffController],
  providers: [
    StaffService,
    MailService,
    CloudinaryService,
    NotificationService,
  ],
})
export class StaffModule {}
