import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class LinkDto {
  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl({}, { message: 'website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/user' })
  @IsOptional()
  @IsUrl({}, { message: 'socialMedia must be a valid URL' })
  socialMedia?: string;

  @ApiPropertyOptional({ example: 'https://wa.me/1234567890' })
  @IsOptional()
  @IsUrl({}, { message: 'messaging must be a valid URL' })
  messaging?: string;

  @ApiPropertyOptional({ example: 'https://customlink.com' })
  @IsOptional()
  @IsUrl({}, { message: 'custom must be a valid URL' })
  custom: string;
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
