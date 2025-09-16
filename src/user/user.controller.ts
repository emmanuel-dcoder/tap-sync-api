import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Put,
  UseInterceptors,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  DeleteAccountDto,
  ForgotPasswordDto,
  LoginDto,
  VerifyOtpDto,
} from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { CreateUserCardDto, LinkDto } from './dto/create-user-card.dto';

@Controller('api/v1/user')
@ApiTags('Onboarding Company or Individual')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create indiviual or company',
    description: `Account type must be either "inidividual" or "company"`,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'Successful' })
  @ApiResponse({ status: 401, description: 'Error performing task' })
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return successResponse({
      message: 'Successful',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Logs and returns a JWT token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT token.',
  })
  @ApiResponse({ status: 400, description: 'Something went wrong' })
  async login(@Body() dto: LoginDto) {
    const data = await this.userService.login(dto);
    return successResponse({
      message: 'Login successful.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('logged-in')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get logged in individual or company' })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unable to perform task' })
  async loggedInUser(@Req() req: any) {
    const userId = req.user._id;
    if (!req) {
      throw new UnauthorizedException('User not authenticated');
    }
    const data = await this.userService.loggedInUser(userId);
    return successResponse({
      message: 'Retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Requests a password reset OTP via email.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset OTP sent.' })
  @ApiResponse({ status: 400, description: 'User not found.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const data = await this.userService.forgotPassword(dto);
    return successResponse({
      message: 'Password reset OTP sent.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change Password',
    description: 'Allows an authenticated user to change their password.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid old password or user not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user._id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const data = await this.userService.changePassword(userId, dto);
    return successResponse({
      message: 'Password changed successfully.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /**update user card details controller */
  @Put('card-details')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'This is to update user card details' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Johnson Ezekiel', nullable: true },
        title: { type: 'string', example: 'Miss.', nullable: true },
        bio: {
          type: 'string',
          example: 'Short biography here',
          nullable: true,
        },
        textColor: { type: 'string', example: '#FFFFFF', nullable: true },
        bannerImage: { type: 'string', format: 'binary', nullable: true },
        profileImage: { type: 'string', format: 'binary', nullable: true },
        // link: {
        //   type: 'object',
        //   properties: {
        //     website: { type: 'string', example: 'https://example.com' },
        //     socialMedia: {
        //       type: 'string',
        //       example: 'https://twitter.com/user',
        //     },
        //     messaging: { type: 'string', example: 'https://wa.me/1234567890' },
        //     custom: { type: 'string', example: 'https://customlink.com' },
        //   },
        //   nullable: true,
        // },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'profileImage', maxCount: 1 },
    ]),
  )
  @ApiResponse({ status: 200, description: 'Card details updated.' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async updateUserCardDetails(
    @Req() req: any,
    @Body() updateUserCardDto: CreateUserCardDto,
    @UploadedFiles()
    files: {
      bannerImage?: Express.Multer.File[];
      profileImage?: Express.Multer.File[];
    },
  ) {
    const user = req.user._id;
    const data = await this.userService.updateUserCardProfile(
      user,
      updateUserCardDto,
      files,
    );
    return {
      message: 'Card details updated',
      code: HttpStatus.OK,
      status: 'success',
      data,
    };
  }

  /**Add link */
  @Put('link-details')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'This is to update user card social media link details',
  })
  @ApiBody({ type: LinkDto })
  @ApiResponse({ status: 200, description: 'Link details updated.' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async addLink(@Req() req: any, @Body() linkDto: LinkDto) {
    const user = req.user._id;
    const data = await this.userService.addLinks(user, linkDto);
    return {
      message: 'Link details updated.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    };
  }

  //**delete account */
  @Post('delete-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Account',
    description: 'Allows an authenticated user to delete their account.',
  })
  @ApiBody({ type: DeleteAccountDto })
  @ApiResponse({ status: 200, description: 'Account deleted successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid password or user not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteAccount(@Req() req: any, @Body() dto: DeleteAccountDto) {
    const userId = req.user._id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const data = await this.userService.deleteAccount(userId, dto);
    return successResponse({
      message: 'Account deleted successfully.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  // @Put('edit-profile/:id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Edit user profile' })
  // @ApiBody({ type: UpdateUserDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User profile updated successfully.',
  // })
  // @ApiResponse({ status: 400, description: 'Invalid data provided.' })
  // async editUserProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
  //   const user = req.user._id;
  //   const data = await this.userService.editUserProfile(user, updateUserDto);
  //   return successResponse({
  //     message: 'User profile updated successfully.',
  //     code: HttpStatus.OK,
  //     status: 'success',
  //     data,
  //   });
  // }

  // @Post('verify-otp')
  // @ApiOperation({
  //   summary: 'Verify OTP',
  //   description:
  //     'Verifies the OTP sent to the individual or company email and activates the account.',
  // })
  // @ApiBody({ type: VerifyOtpDto })
  // @ApiResponse({ status: 200, description: 'User verified successfully.' })
  // @ApiResponse({ status: 400, description: 'Invalid OTP.' })
  // async verifyOtp(@Body() dto: VerifyOtpDto) {
  //   const data = await this.userService.verifyOtp(dto);
  //   return successResponse({
  //     message: 'User verified successfully.',
  //     code: HttpStatus.OK,
  //     status: 'success',
  //     data,
  //   });
  // }

  // @Post('resend-otp')
  // @ApiOperation({
  //   summary: 'Resend OTP',
  //   description: 'Sends a new OTP to the user’s email for verification.',
  // })
  // @ApiBody({
  //   schema: {
  //     properties: { email: { type: 'string', example: 'user@example.com' } },
  //   },
  // })
  // @ApiResponse({ status: 200, description: 'New OTP sent to email.' })
  // @ApiResponse({ status: 400, description: 'User not found.' })
  // async resendOtp(@Body('email') email: string) {
  //   const data = await this.userService.resendOtp(email);
  //   return successResponse({
  //     message: 'New OTP sent to email.',
  //     code: HttpStatus.OK,
  //     status: 'success',
  //     data,
  //   });
  // }

  // @Put(':id/profile-picture')
  // @ApiOperation({
  //   summary: 'Upload profile picture for the user, use form data (Key: file)',
  // })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: { file: { type: 'string', format: 'binary' } },
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Profile picture uploaded successfully',
  // })
  // @ApiResponse({ status: 404, description: 'User not found' })
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadProfilePicture(
  //   @Param('id') userId: string,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   if (!file) throw new BadRequestException('file or image not found');
  //   await this.userService.uploadProfilePicture(userId, file);
  //   return successResponse({
  //     message: 'Profile picture uploaded successfully',
  //     code: HttpStatus.OK,
  //     status: 'success',
  //   });
  // }
}
