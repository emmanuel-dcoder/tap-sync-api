import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './services/ticket.service';
import { TicketController } from './controllers/ticket.controller';
import { Ticket, TicketSchmea } from './schemas/ticket.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchmea }]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
