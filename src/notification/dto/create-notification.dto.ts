import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class CreeateNotificationDto {
  @ApiProperty({
    example: 'Job update',
    description: 'title of the notification',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'project id',
  })
  @IsString()
  projectId?: string;

  @ApiProperty({ description: 'content of the notification' })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'project',
    description: 'type of notification can be job or project',
  })
  @IsString()
  notificationType?: string;

  @ApiProperty({
    example: 'user',
    description: `notitication user can be "user" or "admin"`,
  })
  @IsString()
  userType: string;

  @ApiPropertyOptional({
    example: true,
    description: 'boolean to confirm if notification has been read or not',
  })
  @IsBoolean()
  isRead?: boolean;
}
