import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { MailService } from 'src/core/mail/email';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { NotificationService } from 'src/notification/services/notification.service';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/schemas/notification.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envConfig } from 'src/core/config/env.config';
import { JwtStrategy } from 'src/core/guard/jwt.strategy';
import { RequestSchema } from 'src/request/schemas/request.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Request.name, schema: RequestSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: `${envConfig.jwt.secret}`,
      signOptions: { expiresIn: `${envConfig.jwt.expiry}` },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    MailService,
    CloudinaryService,
    NotificationService,
    JwtStrategy,
  ],
})
export class UserModule {}
