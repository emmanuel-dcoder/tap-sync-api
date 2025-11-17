import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envConfig } from 'src/core/config/env.config';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Staff, StaffSchema } from 'src/staff/schemas/staff.schema';
import { Request, RequestSchema } from 'src/request/schemas/request.schema';
import { TicketService } from 'src/ticket/services/ticket.service';
import { Ticket, TicketSchmea } from 'src/ticket/schemas/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Staff.name, schema: StaffSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Ticket.name, schema: TicketSchmea },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: `${envConfig.jwt.secret}`,
      signOptions: { expiresIn: `${envConfig.jwt.expiry}` },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, CloudinaryService, TicketService],
})
export class AdminModule {}
