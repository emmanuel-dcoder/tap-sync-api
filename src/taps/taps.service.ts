import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Taps } from './schemas/taps.schema';
import mongoose, { Model } from 'mongoose';
import { MailService } from 'src/core/mail/email';
import { CreateTapsDto, TapProfileDto } from './dto/create-taps.dto';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TapsService {
  constructor(
    @InjectModel(Taps.name) private tapsModel: Model<Taps>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async addTaps(dto: CreateTapsDto) {
    try {
      const { profileLink } = dto;
      //validate link

      //validate user with profile link
      const user = await this.userModel.findOne({ profileLink });
      const validUserId = user._id;

      if (!user) {
        await this.tapsModel.create({
          profileLink,
          userId: new mongoose.Types.ObjectId(validUserId),
        });
      }

      return;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }

  //user profile from tap
  async profile(data: TapProfileDto) {
    try {
      const { profileLink } = data;
      //validate link

      if (!profileLink)
        throw new BadRequestException('Profile Link cannot be empty');

      //validate user with profile link
      const user = await this.userModel.findOne({ profileLink });

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
        error?.status ?? 500,
      );
    }
  }
}
