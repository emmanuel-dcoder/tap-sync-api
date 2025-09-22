import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Taps } from './schemas/taps.schema';
import mongoose, { Model } from 'mongoose';
import { MailService } from 'src/core/mail/email';
import { User } from 'src/user/schemas/user.schema';
import { CreateTapsDto } from './dto/create-taps.dto';

@Injectable()
export class TapsService {
  constructor(
    @InjectModel(Taps.name) private tapsModel: Model<Taps>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async addTaps(userId: string, dto: CreateTapsDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      const { profileLink } = dto;
      //validate lin
      const linkExist = await this.tapsModel.findOne({ profileLink });
      if (linkExist) {
        linkExist.count + 1;
        await linkExist.save();
        return;
      }
      await this.tapsModel.create({ profileLink });

      return;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }
}
