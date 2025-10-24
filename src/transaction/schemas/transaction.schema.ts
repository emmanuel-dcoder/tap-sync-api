import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['card', 'subscription'],
    default: null,
  })
  paymentType: string;

  @Prop({ required: false, default: null })
  duration: number;

  @Prop({ required: false, default: null })
  numberOfCards: number;

  @Prop({ default: 'paystack' })
  paymentMethod: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
