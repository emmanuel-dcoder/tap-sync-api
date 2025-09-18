import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  logo: string;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  brandColors: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
