import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  comparePassword,
  generateAccessToken,
  hashPassword,
} from 'src/core/common/utils/authentication';
import { Admin } from './schemas/admin.schema';
import { CloudinaryService } from 'src/core/cloudinary/cloudinary.service';
import { MailService } from 'src/core/mail/email';
import { AdminLoginDto, CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
  ) {}

  async createAdmin(adminDto: CreateAdminDto) {
    try {
      const { password } = adminDto;

      const hashedPassword = await hashPassword(password);

      const admin = await this.adminModel.create({
        ...adminDto,
        password: hashedPassword,
      });
      if (!admin) throw new BadGatewayException('Unable to create admin');
      return admin;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async fetchAdmin() {
    try {
      const admin = await this.adminModel.find();
      if (!admin) throw new NotFoundException('Admin not found');
      return admin;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async updateAdmin(admin: string, payload: any) {
    try {
      const validateAdmin = await this.adminModel.findOne({
        _id: new mongoose.Types.ObjectId(admin),
      });

      if (!validateAdmin) throw new BadRequestException('Invalid admin id');

      await this.adminModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(admin),
        },
        { ...payload },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async login(dto: AdminLoginDto) {
    try {
      const admin = await this.adminModel.findOne({ email: dto.email });

      if (!admin || !(await comparePassword(dto.password, admin.password))) {
        throw new BadRequestException('Invalid email or password');
      }

      const token = generateAccessToken({
        _id: admin._id,
        accountType: admin.accountType,
      });

      return {
        admin: {
          _id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          accountType: admin.accountType,
        },
        token,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async loggedInAdmin(adminId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const admin = await this.adminModel.findOne({
        _id: new mongoose.Types.ObjectId(adminId),
      });

      if (!admin) throw new BadRequestException('Invalid user');

      delete admin.password;

      return {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isVerified: admin.isVerified,
        accountType: admin.accountType,
        profileImage: admin.profileImage,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.adminModel.findOne({
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
}
