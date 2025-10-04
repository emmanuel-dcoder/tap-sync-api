import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RequestDto {
  @ApiProperty({ description: 'official business name' })
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ type: [String], example: ['#FFFFFF', '#000000'] })
  @IsString({ each: true })
  brandColors: string[];
}
