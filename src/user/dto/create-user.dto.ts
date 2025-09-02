import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { accountType } from '../enum/user.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
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
  @ApiProperty()
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
