import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  logo: string;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ type: [String], required: true })
  brandColors: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false })
  staffId: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isStaff: boolean;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
