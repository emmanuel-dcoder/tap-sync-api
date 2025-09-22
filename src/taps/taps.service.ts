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
    private readonly mailService: MailService,
  ) {}

  async addTaps(dto: CreateTapsDto) {
    try {
      const { profileLink } = dto;
      //validate lin
      const linkExist = await this.tapsModel.findOne({ profileLink });
      if (linkExist) {
        linkExist.count + 1;
        await linkExist.save();
        return;
      }

      await this.tapsModel.create({ profileLink, $inc: { count: 1 } });

      return;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }
}
