import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsMongoId,
  MinLength,
} from 'class-validator';
import { employmentType } from '../enum/staff.enum';

export class CreateStaffDto {
  @ApiProperty({ example: 'Benjamin Joseph' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manager' })
  @IsString()
  position: string;

  @ApiProperty({ example: 'joseph@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '27 Broad Street, Lagos' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Logistics' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: employmentType.contract, enum: employmentType })
  @IsOptional()
  @IsEnum(employmentType)
  employmentType?: employmentType;

  @ApiProperty({ example: '+2349087675433' })
  @IsOptional()
  @IsString()
  contactNo?: string;

  @ApiProperty({ example: '+2349087675433' })
  @IsOptional()
  @IsString()
  emergencyContactNo?: string;

  @ApiProperty({ example: '2025-01-23' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ example: '2025-12-23' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}
export class NotifyStaffDto {
  @ApiProperty({
    type: [String],
    example: ['652f23f1c9e7b3f8f13b92e1', '652f23f1c9e7b3f8f13b92e2'],
    description: 'Array of staff MongoDB IDs',
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'staffIds array cannot be empty' })
  @IsMongoId({ each: true, message: 'Each staffId must be a valid MongoDB ID' })
  staffIds: string[];

  @ApiProperty({
    type: String,
    example: 'Please attend the company meeting at 10 AM.',
    description: 'Notification message to send to all staff',
  })
  @IsString()
  @MinLength(3, { message: 'Message must be at least 3 characters long' })
  message: string;
}
