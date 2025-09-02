import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  projectId: string;

  @Prop({ required: false })
  notificationtType: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: String, enum: ['user', 'admin'] })
  userType: 'user' | 'admin';

  @Prop({ type: mongoose.Types.ObjectId, refPath: 'userType' })
  user: mongoose.Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
