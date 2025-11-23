import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUrl } from 'class-validator';
import { accountType } from '../enum/user.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'benjamin joseph' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joseph@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '09089876543' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'jojo' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'secret' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'individual' })
  @IsString()
  accountType: accountType;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  // @Length(4, 4)
  otp: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'opeoluwaoyedejif@gmail.com',
    description: 'email of the user',
  })
  @IsEmail()
  email: string;
}

export class LoginDto {
  @ApiProperty({ example: 'opeoluwaoyedejif@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret1' })
  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}

export class DeleteAccountDto {
  @ApiProperty()
  @IsString()
  password: string;
}

export class CalendifyDto {
  @ApiProperty()
  @IsString()
  link: string;
}

export class CustomLinkDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl({}, { message: 'website must be a valid URL' })
  url: string;

  @ApiProperty({ example: 'social media link' })
  @IsString()
  name: string;
}
