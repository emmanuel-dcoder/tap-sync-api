import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Taps } from './schemas/taps.schema';
import mongoose, { Model } from 'mongoose';
import { MailService } from 'src/core/mail/email';
import { CreateTapsDto, TapProfileDto } from './dto/create-taps.dto';
import { User } from 'src/user/schemas/user.schema';
import { Staff } from 'src/staff/schemas/staff.schema';

@Injectable()
export class TapsService {
  constructor(
    @InjectModel(Taps.name) private tapsModel: Model<Taps>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
    private readonly mailService: MailService,
  ) {}

  async addTaps(dto: CreateTapsDto) {
    try {
      const { profileLink } = dto;

      let companyId;
      if (profileLink.includes('company')) {
        companyId = profileLink.split('company-')[1];
      }
      const user = companyId
        ? await this.userModel.findOne({
            _id: new mongoose.Types.ObjectId(companyId),
          })
        : await this.userModel.findOne({ profileLink });

      if (!user) {
        throw new BadRequestException(
          'User with this profile link does not exist',
        );
      }

      await this.tapsModel.create({
        profileLink,
        userId: new mongoose.Types.ObjectId(user._id),
      });

      return { message: 'Tap recorded successfully' };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }

  async profile(data: TapProfileDto) {
    try {
      const { profileLink } = data;
      if (!profileLink) {
        throw new BadRequestException('Profile Link cannot be empty');
      }

      const user = await this.userModel.findOne({ profileLink });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      return {
        _id: user._id,
        profileLink: user.profileLink,
        businessName: user.businessName,
        businessEmail: user.businessEmail,
        businessPhoneNumber: user.businessPhoneNumber,
        businessUsername: user.businessUsername,
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        profileImage: user.profileImage,
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
        error?.status ?? 500,
      );
    }
  }

  //get staff profile with tap
  async staffProfile(data: TapProfileDto) {
    try {
      const { profileLink } = data;
      if (!profileLink) {
        throw new BadRequestException('Staff Profile Link cannot be empty');
      }

      const staff = await this.staffModel.findOne({ profileLink });

      if (!staff) {
        throw new BadRequestException('User not found');
      }

      return staff;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }
}
