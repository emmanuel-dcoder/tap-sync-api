import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { employmentType, staffStatus } from '../enum/staff.enum';

export type StaffDocument = Staff & Document;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  position: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop()
  address: string;

  @Prop()
  staffId: string;

  @Prop()
  department: string;

  @Prop({
    type: String,
    enum: employmentType,
    default: employmentType.fullTime,
  })
  employmentType: employmentType;

  @Prop({
    type: String,
    enum: staffStatus,
    default: staffStatus.active,
  })
  status: staffStatus;

  @Prop({
    type: String,
    default: null,
  })
  profileLink: string;

  @Prop()
  contactNo: string;

  @Prop()
  image: string;

  @Prop()
  emergencyContactNo: string;

  @Prop({ type: Number, default: 0, min: 0 })
  points: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  companyId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  startDate: Date;

  @Prop()
  endDate: Date;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
