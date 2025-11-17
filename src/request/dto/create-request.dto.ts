import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { cardType } from '../enum/request.enum';

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

  @ApiProperty({ type: String })
  @IsString()
  cardType: string;

  @ApiProperty({ type: [String], example: ['#FFFFFF', '#000000'] })
  @IsString({ each: true })
  brandColors: string[];
}
