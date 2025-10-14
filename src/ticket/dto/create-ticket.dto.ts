import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { status } from '../enum/ticket.enum';

export class CreateTicketDto {
  @ApiProperty({
    example: 'Josephine',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'subject of the ticket',
    example: ' Unable to login to account',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'content',
    example: 'content or description of the ticket',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: status.resolved,
  })
  @IsOptional()
  @IsString()
  status?: status;

  @ApiPropertyOptional({
    example: '680f99adb128e4222fc02280',
  })
  @IsOptional()
  @IsString()
  user?: string;
}
