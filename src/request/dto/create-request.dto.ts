import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestDto {
  @ApiProperty({ description: 'official business name' })
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ type: [String], example: ['#FFFFFF', '#000000'] })
  @IsString({ each: true })
  brandColors: string[];
}
