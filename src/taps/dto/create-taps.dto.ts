import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTapsDto {
  @ApiProperty()
  @IsString()
  profileLink: string;
}
