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
import { accountType } from './enum/user.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;
      const validateUser = await this.userModel.findOne({ email });
      if (validateUser) throw new BadGatewayException('Email already exist');
      const hashedPassword = await hashPassword(password);
      const createUser = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });

      delete createUser.password;

      return createUser;
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

  async login(dto: LoginDto): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email: dto.email });

      if (!user || !(await comparePassword(dto.password, user.password))) {
        throw new BadRequestException('Invalid email or password');
      }

      const payload = { _id: user._id, email: user.email, sub: user._id };

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
