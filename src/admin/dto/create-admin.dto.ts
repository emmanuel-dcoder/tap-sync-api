import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'test' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'secret' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'testadmin@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;
}

export class ForgotAdminPasswordDto {
  @ApiProperty({ example: 'testadmin@gmail.com' })
  @IsEmail()
  email: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'testadmin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret' })
  @IsString()
  password: string;
}
