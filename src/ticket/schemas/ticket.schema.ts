import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { status } from '../enum/ticket.enum';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ['User', 'Admin'] })
  userType: 'User' | 'Admin';

  @Prop({ type: mongoose.Types.ObjectId, refPath: 'userType' })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  ticketId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: status.pending })
  status: status;
}

export const TicketSchmea = SchemaFactory.createForClass(Ticket);
