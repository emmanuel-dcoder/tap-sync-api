import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class LinkDto {
  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({ example: '+2348137123489' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['facebook.come', 'twitter.com'],
  })
  @IsOptional()
  @IsUrl({}, { message: 'socialMedia must be a valid URL' })
  socialMedia?: string[];

  @ApiPropertyOptional({ example: 'https://wa.me/1234567890' })
  @IsOptional()
  @IsUrl({}, { message: 'messaging must be a valid URL' })
  messaging?: string[];

  @ApiPropertyOptional({ example: 'https://customlink.com' })
  @IsOptional()
  @IsUrl({}, { message: 'custom must be a valid URL', each: true })
  custom: string;

  @ApiProperty({ type: [String], example: ['#FFFFFF', '#000000'] })
  brandColors: string[];
}

export class CreateUserCardDto {
  @ApiProperty({ description: 'name of the user', example: 'Johnson Ezekiel' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Name title', example: 'Miss.' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Brief biography or introduction',
  })
  @IsString()
  bio: string;

  @ApiPropertyOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ description: 'text color' })
  @IsString()
  textColor: string;

  @ApiProperty({ description: 'background color' })
  @IsString()
  backgroundColor: string;

  @ApiPropertyOptional({ type: LinkDto })
  @IsOptional()
  link?: LinkDto;
}
