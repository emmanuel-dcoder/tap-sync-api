import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: String, enum: ['User', 'Admin'] })
  userType: 'User' | 'Admin';

  @Prop({ type: mongoose.Types.ObjectId, refPath: 'userType' })
  user: mongoose.Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
