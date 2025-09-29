import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTapsDto {
  @ApiProperty({ example: 'https://tapsync.com/123' })
  @IsString()
  profileLink: string;
}

export class TapProfileDto {
  @ApiProperty({
    description: 'profile link url',
    example: 'https://tapsync.com/123',
  })
  @IsString()
  profileLink: string;
}
