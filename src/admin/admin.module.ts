import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { MailService } from 'src/core/mail/email';

import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService, MailService, CloudinaryService],
})
export class AdminModule {}
