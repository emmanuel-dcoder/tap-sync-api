import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { AdminDashboardService } from './dashboard.service';
import { successResponse } from 'src/core/config/response';

@Controller('admin-dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Admin Dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  /**
   * Get all successful transactions in the last 12 months.
   * Returns a list of months with transaction counts.
   */
  @Get('transactions/monthly')
  @ApiOperation({
    summary: 'Get successful transactions (last 12 months)',
    description:
      'Returns the total count of successful transactions for each of the last 12 months.',
  })
  @ApiOkResponse({
    description: 'List of successful transactions per month.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – missing or invalid JWT token.',
  })
  async getSuccessfulTransactions() {
    const data =
      await this.adminDashboardService.getSuccessfulTransactionsLast12Months();
    return successResponse({
      message: 'List of successful transactions per month.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /**
   * Get the percentage monthly increment or decrement in successful transaction amounts.
   */
  @Get('transactions/monthly-percentage-change')
  @ApiOperation({
    summary: 'Get monthly percentage change in successful transactions',
    description:
      'Calculates the month-over-month percentage change in total transaction amounts for successful transactions within the last 12 months.',
  })
  @ApiOkResponse({
    description:
      'Percentage monthly increment/decrement by total transaction amount.',
  })
  async getMonthlyPercentageChange() {
    const data =
      await this.adminDashboardService.getMonthlyTransactionPercentageChange();
    return successResponse({
      message:
        'Percentage monthly increment/decrement by total transaction amount.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /**
   * Get total users by account type (company and individual).
   */
  @Get('users/account-type-summary')
  @ApiOperation({
    summary: 'Get user count by account type',
    description:
      'Returns the total number of users grouped by account type: company and individual.',
  })
  @ApiOkResponse({
    description: 'Total count of users per account type.',
  })
  async getUserAccountSummary() {
    const data = await this.adminDashboardService.getUserAccountTypeSummary();
    return successResponse({
      message: 'Total count of users per account type.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /**
   * GET: /admin-dashboard/requests/account-type-summary
   */
  @Get('requests/account-type-summary')
  @ApiOperation({ summary: 'Get total requests grouped by user account type' })
  @ApiResponse({
    status: 200,
    description: 'Returns request counts for company and individual users',
  })
  async getRequestAccountSummary() {
    const data =
      await this.adminDashboardService.getRequestAccountTypeSummary();

    return successResponse({
      message: 'Company and individual users count',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
