import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestDto {
  @ApiProperty({ description: 'official business name' })
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ type: [String], example: ['#FFFFFF', '#000000'] })
  @IsString({ each: true })
  brandColors: string[];
}
