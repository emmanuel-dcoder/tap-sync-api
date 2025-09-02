import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { accountType } from '../enum/user.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ type: String, enum: accountType, default: null, required: true })
  accountType: accountType;

  @Prop({ required: false, default: null })
  verificationOtp: string;

  @Prop({ required: false, default: null })
  resetToken: string;

  @Prop({ default: null })
  resetTokenDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
