import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TapDocument = Taps & Document;

@Schema({ timestamps: true })
export class Taps {
  @Prop({ default: null })
  profileLink: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;
}

export const TapsSchema = SchemaFactory.createForClass(Taps);
