import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description:
      'This is optional, only compulsory for subscription payment type',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description: 'type of payment can be either subscription or card ',
    enum: ['card', 'subscription'],
  })
  @IsString()
  paymentType: string;

  @ApiProperty({
    description: 'this is optional, only compulsory for card payment type',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  numberOfCards?: number;
}
