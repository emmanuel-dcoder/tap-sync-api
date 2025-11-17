import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false, default: null })
  startDate: string;

  @Prop({ required: false, default: null })
  endDate: string;

  @Prop({ required: false, default: null })
  durationInMonths: number;

  @Prop({
    required: true,
    enum: ['card', 'subscription'],
    default: null,
  })
  paymentType: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
