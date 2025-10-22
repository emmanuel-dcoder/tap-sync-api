import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsMongoId, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the user',
  })
  @IsString()
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'duration of the month',
    example: 1,
  })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'payment type can be either subscription or card',
    example: 'card',
  })
  @IsString()
  paymentType: string;
}
