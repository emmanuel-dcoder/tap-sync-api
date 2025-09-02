import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, default: 'admin' })
  accountType: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
