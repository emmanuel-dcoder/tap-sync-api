import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { accountType, UserStatus } from '../enum/user.enum';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Link {
  @Prop()
  website: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: [String] })
  socialMedia: string[];

  @Prop({ type: [String] })
  messaging: string[];

  @Prop()
  custom: string;
}
@Schema({ timestamps: true })
export class User {
  @Prop({ required: false })
  name: string;

  @Prop({ default: null })
  profileLink: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: null })
  businessName: string;

  @Prop({ default: null })
  businessEmail: string;

  @Prop({ default: null })
  businessUsername: string;

  @Prop({ default: null })
  businessPhoneNumber: string;

  @Prop({ default: null })
  title: string;

  @Prop({ default: null })
  bio: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ default: null })
  bannerImage: string;

  @Prop({ default: null })
  backgroundColor: string;

  @Prop({ default: null })
  textColor: string;

  @Prop({ default: null })
  quantity: number;

  @Prop({ type: Link })
  link: Link;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ required: true, default: false })
  isSubscribe: boolean;

  @Prop({ type: String, enum: accountType, default: null, required: true })
  accountType: accountType;

  @Prop({ required: false, default: null })
  verificationOtp: string;

  @Prop({ required: false, default: null })
  resetToken: string;

  @Prop({ default: null })
  resetTokenDate: Date;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);
