import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from 'src/transaction/schemas/transaction.schema';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Get successful transactions within the last 12 months
   */
  async getSuccessfulTransactionsLast12Months() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Step 1: Aggregate successful transactions per month
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          status: 'success',
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

    // Step 2: Prepare month names
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

    // Step 3: Generate the last 12 months with counts
    const months: { month: string; count: number }[] = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = `${monthNames[date.getMonth()]} ${year}`;

      // Find if this month/year exists in aggregation result
      const matched = transactions.find(
        (t) => t._id.year === year && t._id.month === month,
      );

      months.push({
        month: monthName,
        count: matched ? matched.count : 0,
      });
    }

    return months;
  }

  /**
   * Get percentage monthly increment or decrement in transaction amounts
   * (Only for successful transactions)
   */
  async getMonthlyTransactionPercentageChange() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Group total transaction amount per month
    const monthlyData = await this.transactionModel.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Calculate monthly % change
    const percentageChanges = [];
    for (let i = 1; i < monthlyData.length; i++) {
      const prev = monthlyData[i - 1].totalAmount;
      const curr = monthlyData[i].totalAmount;
      const percentChange = ((curr - prev) / (prev || 1)) * 100; // Avoid division by zero
      percentageChanges.push({
        month: monthlyData[i]._id.month,
        year: monthlyData[i]._id.year,
        totalAmount: curr,
        percentageChange: percentChange.toFixed(2),
      });
    }

    return percentageChanges;
  }

  /**
   * Get total count of users by account type (company & individual)
   */
  async getUserAccountTypeSummary() {
    const result = await this.userModel.aggregate([
      {
        $match: {
          accountType: { $in: ['company', 'individual'] },
        },
      },
      {
        $group: {
          _id: '$accountType',
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    // Convert array to object
    const summary = result.reduce((acc, curr) => {
      acc[curr._id] = curr.totalUsers;
      return acc;
    }, {});

    return summary;
  }
}
