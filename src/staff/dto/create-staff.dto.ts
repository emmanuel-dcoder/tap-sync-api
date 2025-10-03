import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
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
