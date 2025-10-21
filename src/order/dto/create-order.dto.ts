import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsMongoId } from 'class-validator';

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
}
