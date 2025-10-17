import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreeateNotificationDto {
  @ApiProperty({
    example: 'Job update',
    description: 'title of the notification',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'content of the notification',
    example: 'this is the body of the notification',
  })
  @IsString()
  body: string;

  @ApiProperty({
    example: 'User',
    description: `notitication user can be "User" or "Admin"`,
  })
  @IsString()
  userType: string;

  @ApiProperty({
    example: true,
    description: 'boolean to confirm if notification has been read or not',
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
