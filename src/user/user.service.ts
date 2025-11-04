import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  CreateUserDto,
  DeleteAccountDto,
  ForgotPasswordDto,
  LoginDto,
  VerifyOtpDto,
} from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';

import {
  AlphaNumeric,
  comparePassword,
  hashPassword,
  RandomSixDigits,
} from 'src/core/common/utils/authentication';
import { MailService } from 'src/core/mail/email';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserCardDto } from './dto/create-user-card.dto';
import { RequestDto } from 'src/request/dto/create-request.dto';
import { Request } from 'src/request/schemas/request.schema';
import { NotificationService } from 'src/notification/services/notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) {}

  async create(createUserDto: CreateUserDto, files?: any) {
    try {
      let logo: string | undefined;

      if (files?.bannerImage?.[0]) {
        logo = await this.uploadUserImage(files.logo[0]);
      }
      const { email, password } = createUserDto;
      const validateUser = await this.userModel.findOne({ email });
      if (validateUser) throw new BadGatewayException('Email already exist');

      const hashedPassword = await hashPassword(password);
      const updateData = {
        ...createUserDto,
        password: hashedPassword,
        ...(logo && { logo }),
      };
      const createUser = await this.userModel.create(updateData);
      createUser.password = undefined;

      try {
        await this.notificationService.create({
          title: 'Tapsync: Welcome 🤝',
          body: 'You are welcome onboard',
          userType: 'User',
          user: `${createUser._id}`,
        });
      } catch (error) {
        console.log('notification Error');
      }

      return createUser;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async login(dto: LoginDto): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email: dto.email });

      if (!user || !(await comparePassword(dto.password, user.password))) {
        throw new BadRequestException('Invalid email or password');
      }

      const payload = {
        _id: user._id,
        email: user.email,
        sub: user._id,
        accountType: user.accountType,
      };

      const token = this.jwtService.sign(payload);

      return {
        user: {
          _id: user._id,
          email: user.email,
          token,
          name: user.name,
          username: user.username,
          phone: user.phone,
          accountType: user.accountType,
        },
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async loggedInUser(userId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });

      if (!user) throw new BadRequestException('Invalid user');

      delete user.password;

      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
        phone: user.phone,
        isSubscribe: user.isSubscribe,
        accountType: user.accountType,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {
    try {
      const user = await this.userModel.findOne({ email: dto.email });

      if (!user || user.verificationOtp !== dto.otp) {
        throw new BadRequestException('Invalid OTP');
      }

      user.isVerified = true;
      user.verificationOtp = null;
      await user.save();

      try {
        await this.notificationService.create({
          title: 'Tapsync: OTP verified 🤝',
          body: 'Your account has been verified',
          userType: 'User',
          user: `${user._id}`,
        });
      } catch (error) {
        console.log('notification Error');
      }

      return { message: 'User verified successfully' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async resendOtp(email: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) throw new BadRequestException('User not found');

      const otp = RandomSixDigits();
      user.verificationOtp = otp;
      await user.save();

      await this.mailService.sendMailNotification(
        email,
        'New OTP',
        { otp },
        'otp_resend',
      );
      return { message: 'New OTP sent to email' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.userModel.findOne({ email: dto.email });
      if (!user) throw new BadRequestException('User not found');

      //generate random password
      const dummyPassword = AlphaNumeric(6);
      const hashedPassword = await hashPassword(dummyPassword);
      user.password = hashedPassword;
      await user.save();
      await this.mailService.sendMailNotification(
        dto.email,
        'Forgot Password',
        { name: user.name, dummyPassword },
        'forgot-password',
      );

      return { message: 'Password reset OTP sent' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.userModel.findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { password: 1 },
      );

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!(await comparePassword(dto.oldPassword, user.password))) {
        throw new BadRequestException('Old and new password does not match');
      }

      user.password = await hashPassword(dto.newPassword);
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      if (!user) throw new NotFoundException('User not found');
      const uploadImage = await this.uploadUserImage(file);
      user.profileImage = uploadImage;

      await user.save();
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  //user profile service
  async userProfile(userId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });

      if (!user) throw new BadRequestException('Invalid user');

      return {
        _id: user._id,
        profileLink: user.profileLink,
        businessName: user.businessName,
        businessEmail: user.businessEmail,
        businessPhoneNumber: user.businessPhoneNumber,
        businessUsername: user.businessUsername,
        isSubscribe: user.isSubscribe,
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        accountType: user.accountType,
        title: user.title,
        bannerImage: user.bannerImage,
        textColor: user.textColor,
        link: user.link,
        backgroundColor: user.backgroundColor,
        bio: user.bio,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async updateUserCardProfile(
    accountType: string,
    userId: string,
    createUserCardDto: CreateUserCardDto,
    files?: any,
  ) {
    try {
      let bannerUpload: string | undefined;
      let profileUpload: string | undefined;
      let logo: string | undefined;

      if (files?.bannerImage?.[0]) {
        bannerUpload = await this.uploadUserImage(files.bannerImage[0]);
      }

      if (files?.profileImage?.[0]) {
        profileUpload = await this.uploadUserImage(files.profileImage[0]);
      }
      if (files?.logo?.[0]) {
        logo = await this.uploadUserImage(files.logo[0]);
      }

      const user = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      let profileLink;
      let validateProfileLink;

      if (user.profileLink === null || !user.profileLink) {
        do {
          accountType === 'company'
            ? (profileLink = `https://tapsync.com/${user.name}/${AlphaNumeric(3, 'number')}`)
            : (profileLink = `https://tapsync.com/${AlphaNumeric(3, 'number')}`);
          validateProfileLink = await this.userModel.findOne({ profileLink });
        } while (validateProfileLink);
      }

      const updateData = {
        ...createUserCardDto,
        ...(bannerUpload && { bannerImage: bannerUpload }),
        ...(profileUpload && { profileImage: profileUpload }),
        ...(logo && { logo }),
      };

      try {
        await this.notificationService.create({
          title: 'Tapsync: Profile Updated 🤝',
          body: 'Your profile has been updated 👍👍',
          userType: 'User',
          user: `${user._id}`,
        });
      } catch (error) {
        console.log('notification Error');
      }

      return await this.userModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId) },
        { ...updateData, profileLink },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  /**card request */
  async cardRequest(userId: string, requestDto: RequestDto, files?: any) {
    try {
      let logo: string | undefined;

      if (files?.logo?.[0]) {
        logo = await this.uploadUserImage(files.logo[0]);
      }

      const request = await this.requestModel.create({
        ...requestDto,
        logo,
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!request)
        throw new BadRequestException('Unable to create card request...');

      try {
        await this.notificationService.create({
          title: 'Tapsync: Card Request 🤝',
          body: 'Your card request is successful 👍👍',
          userType: 'User',
          user: `${userId}`,
        });
      } catch (error) {
        console.log('notification Error');
      }
      return request;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  //edit user profile
  async editUserProfile(user: string, UpdateUserDto: UpdateUserDto) {
    try {
      const validateUser = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(user),
      });

      if (!validateUser) throw new BadRequestException('Invalid user id');

      await this.userModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(user) },
        { ...UpdateUserDto },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  private async uploadUserImage(file: Express.Multer.File | undefined) {
    try {
      if (!file) {
        return null;
      }
      const uploadedFile = await this.cloudinaryService.uploadFile(
        file,
        'profile-image',
      );

      return uploadedFile.secure_url;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.userModel.findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { password: 1 },
      );

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!(await comparePassword(dto.password, user.password))) {
        throw new BadRequestException('Incorrect password');
      }

      await this.userModel.deleteOne({
        _id: new mongoose.Types.ObjectId(userId),
      });

      return { message: 'Account deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }
}
