import {
  Controller,
  HttpStatus,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { UserDashboardService } from './dashboard.service';

@Controller('api/v1/dashboard-analysis')
@ApiTags('User Dashboard Analysis')
export class UserDashboardController {
  constructor(private readonly userDashboardSevice: UserDashboardService) {}

  @Get('cards')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch card analysis' })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unable to perform task' })
  async card(@Req() req: any) {
    const userId = req.user._id;
    if (!req) {
      throw new UnauthorizedException('User not authenticated');
    }
    const data = await this.userDashboardSevice.cardAnalysis(userId);
    return successResponse({
      message: 'Retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('monthly')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch monthly analysis' })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unable to perform task' })
  async monthlyAnalysis(@Req() req: any) {
    const userId = req.user._id;
    if (!req) {
      throw new UnauthorizedException('User not authenticated');
    }
    const data = await this.userDashboardSevice.getTapCountLast12Months(userId);
    return successResponse({
      message: 'Retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
