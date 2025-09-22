import { Module } from '@nestjs/common';
import { TapsService } from './taps.service';
import { TapsController } from './taps.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Taps, TapsSchema } from './schemas/taps.schema';
import { MailService } from 'src/core/mail/email';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Taps.name, schema: TapsSchema }]),
  ],
  controllers: [TapsController],
  providers: [TapsService, MailService],
})
export class TapsModule {}
