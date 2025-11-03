import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, RequestDocument } from 'src/request/schemas/request.schema';
import { Transaction } from 'src/transaction/schemas/transaction.schema';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Request.name)
    private readonly requestModel: Model<RequestDocument>,
  ) {}

  /**
   * Get successful transactions within the last 12 months
   */
  async getSuccessfulTransactionsLast12Months() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Step 1: Aggregate successful transactions by month, summing total amount
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
          totalAmount: { $sum: '$amount' }, // sum of amounts instead of count
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Step 2: Month names for display
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

    // Step 3: Fill in all months (including those without data)
    const months: { month: string; totalAmount: number }[] = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = `${monthNames[date.getMonth()]} ${year}`;

      const matched = transactions.find(
        (t) => t._id.year === year && t._id.month === month,
      );

      months.push({
        month: monthName,
        totalAmount: matched ? matched.totalAmount : 0,
      });
    }

    return months;
  }

  /**
   * Get percentage monthly increment or decrement in transaction amounts
   * (Only for successful transactions)
   * Also include total amount for transactions with status "paid"
   */
  async getMonthlyTransactionPercentageChange() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    // Aggregate total amount for current and previous month (status = success)
    const monthlyData = await this.transactionModel.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startOfPreviousMonth },
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

    // Find previous and current month totals
    const prevMonthData = monthlyData.find(
      (m) =>
        m._id.year === startOfPreviousMonth.getFullYear() &&
        m._id.month === startOfPreviousMonth.getMonth() + 1,
    );

    const currMonthData = monthlyData.find(
      (m) =>
        m._id.year === startOfCurrentMonth.getFullYear() &&
        m._id.month === startOfCurrentMonth.getMonth() + 1,
    );

    const prevTotal = prevMonthData?.totalAmount || 0;
    const currTotal = currMonthData?.totalAmount || 0;

    // Calculate percentage difference
    const difference = currTotal - prevTotal;
    const percentChange = prevTotal
      ? ((difference / prevTotal) * 100).toFixed(2)
      : currTotal > 0
        ? 100
        : 0;

    const status =
      currTotal > prevTotal
        ? 'increase'
        : currTotal < prevTotal
          ? 'decrease'
          : 'no change';

    // ✅ Calculate total amount for transactions where status = "paid"
    const totalPaidData = await this.transactionModel.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalPaidAmount = totalPaidData[0]?.totalAmount || 0;

    // ✅ Final Response
    return {
      previousMonth: {
        month: startOfPreviousMonth.toLocaleString('default', {
          month: 'long',
        }),
        year: startOfPreviousMonth.getFullYear(),
        totalAmount: prevTotal,
      },
      currentMonth: {
        month: startOfCurrentMonth.toLocaleString('default', { month: 'long' }),
        year: startOfCurrentMonth.getFullYear(),
        totalAmount: currTotal,
      },
      percentageChange: `${percentChange}%`,
      status,
      totalPaidAmount, // 👈 added this field
    };
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

  /**
   * Get total requests made by users with accountType 'company' or 'individual'
   */
  async getRequestAccountTypeSummary() {
    const result = await this.requestModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.accountType',
          totalRequests: { $sum: 1 },
        },
      },
    ]);

    const companyRequests =
      result.find((r) => r._id === 'company')?.totalRequests || 0;
    const individualRequests =
      result.find((r) => r._id === 'individual')?.totalRequests || 0;

    return {
      companyRequests,
      individualRequests,
      totalCardsRequests: companyRequests + individualRequests,
    };
  }
}
