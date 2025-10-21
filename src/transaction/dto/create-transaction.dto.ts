import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

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
    description: 'amount of the transaction',
    example: 34000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'duration of the month',
    example: 1,
  })
  @IsNumber()
  duration: number;
}
