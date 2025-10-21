import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID of the user',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Email of the user',
  })
  @IsString()
  @IsEmail()
  email: string;

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
