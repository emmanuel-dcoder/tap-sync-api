import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TapDocument = Taps & Document;

@Schema({ timestamps: true })
export class Taps {
  @Prop({ default: null })
  profileLink: string;

  @Prop({ type: Number })
  count: number;
}

export const TapsSchema = SchemaFactory.createForClass(Taps);
