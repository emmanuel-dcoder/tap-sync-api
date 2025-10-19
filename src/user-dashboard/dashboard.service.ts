import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MailService } from 'src/core/mail/email';
import { User } from 'src/user/schemas/user.schema';
import { Request } from 'src/request/schemas/request.schema';
import { Taps } from 'src/taps/schemas/taps.schema';

@Injectable()
export class UserDashboardService {
  constructor(
    @InjectModel(Taps.name) private tapsModel: Model<Taps>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Request.name) private requestModel: Model<Request>,
    private readonly mailService: MailService,
  ) {}

  async getTapCountLast12Months(
    userId: string,
  ): Promise<{ month: string; count: number }[]> {
    try {
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      // Calculate date 12 months ago
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      // Aggregate taps by month and year
      const tapCounts = await this.tapsModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]);

      // Generate list of all months in the last 12 months
      const months: { month: string; count: number }[] = [];
      const currentDate = new Date();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // MongoDB months are 1-based
        const monthName = `${monthNames[date.getMonth()]} ${year}`;

        // Find matching tap count or set to 0
        const tapCount = tapCounts.find(
          (tc) => tc._id.year === year && tc._id.month === month,
        );
        months.push({
          month: monthName,
          count: tapCount ? tapCount.count : 0,
        });
      }

      return months;
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred while fetching tap count',
        error.status || 500,
      );
    }
  }

  async cardAnalysis(userId: string) {
    try {
      if (!userId) throw new BadRequestException('userId cannot be empty');

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }

      const cardRequest = await this.requestModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        isStaff: false,
      });
      const activeStaffCard = await this.requestModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        isStaff: true,
      });

      const taps = await this.tapsModel.find({
        userId: new mongoose.Types.ObjectId(userId),
      });

      const user = await this.userModel.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });

      const profileLink = user.profileLink;
      const accountType = user.accountType;

      return {
        activeCards: cardRequest.length || 0,
        numberOfTaps: taps.length || 0,
        activeStaffIdCard: activeStaffCard.length || 0,
        profileLink,
        accountType,
      };
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? 500,
      );
    }
  }
}
