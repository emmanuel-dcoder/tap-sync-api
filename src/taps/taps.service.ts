import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Taps } from './schemas/taps.schema';
import mongoose, { Model } from 'mongoose';
import { MailService } from 'src/core/mail/email';
import { CreateTapsDto } from './dto/create-taps.dto';
import { User } from 'src/user/schemas/user.schema';

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
      //validate lin

      //validate user with profile link
      const user = await this.userModel.findOne({ profileLink });
      const validUserId = user._id;

      if (user) {
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
}
