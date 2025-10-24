import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'ID of the user',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'reference of the payment',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'type of payment can be either subscription or card ',
    enum: ['card', 'subscription'],
  })
  @IsString()
  paymentType: string;

  @ApiProperty({
    description: 'amount of the transaction',
    example: 34000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description:
      'This is optional, only compulsory for subscription payment type',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description: 'this is optional, only compulsory for card payment type',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  numberOfCards?: number;
}
