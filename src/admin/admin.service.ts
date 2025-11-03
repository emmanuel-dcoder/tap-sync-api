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
  hashPassword,
} from 'src/core/common/utils/authentication';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { AdminLoginDto, CreateAdminDto } from './dto/create-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { UserStatus } from 'src/user/enum/user.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

      const payload = {
        _id: admin._id,
        email: admin.email,
        sub: admin._id,
      };

      const token = this.jwtService.sign(payload);

      return {
        admin: {
          _id: admin._id,
          email: admin.email,
          token,
        },
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

  /**
   * Fetch users by accountType with optional search
   */
  async fetchUsersByAccountType(accountType: string, search?: string) {
    try {
      if (!accountType) {
        throw new BadRequestException('accountType is required');
      }

      const query: any = { accountType };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await this.userModel.find(query);

      if (!users || users.length === 0)
        throw new NotFoundException('No users found for the given criteria');

      return users;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  /**
   * Update user details by ID
   */
  async updateUser(userId: string, payload: any) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: payload },
        { new: true, runValidators: true },
      );

      return updatedUser;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  /**
   * 🟡 Update user status
   */
  async updateUserStatus(userId: string, status: UserStatus) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      user.status = status;
      await user.save();

      return user;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  /**
   * Fetch users by accountType ('company' or 'individual') with search + pagination
   */
  async fetchCompanyOrIndividualUsers(
    accountType: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      // Base query
      const query: any = { accountType: accountType.toLowerCase() };

      // Optional search filter
      if (search && search.trim() !== '') {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Fetch paginated data
      const [users, total] = await Promise.all([
        this.userModel
          .find({ ...query, isSubscribe: true })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.userModel.countDocuments(query),
      ]);

      if (!users.length) {
        throw new NotFoundException('No users found for the given criteria');
      }

      return {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        users,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
