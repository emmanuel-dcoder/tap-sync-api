import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  Req,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { NotificationService } from '../services/notification.service';
import { PaginationDto } from 'src/core/common/pagination/pagination';
import { CreeateNotificationDto } from '../dto/create-notification.dto';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';

@ApiTags('notification')
@Controller('api/v1/notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreeateNotificationDto })
  @ApiOperation({ summary: 'Create notification' })
  @ApiResponse({
    status: 201,
    description: 'notification created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Req() req: any, @Body() payload: CreeateNotificationDto) {
    const userId = req.user?._id;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    const data = await this.notificationService.create({
      ...payload,
      user: userId,
    });
    return successResponse({
      message: 'Notification created successfully',
      code: HttpStatus.CREATED,
      status: 'success',
      data,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all notification with search, pagination and status filter',
  })
  @ApiResponse({ status: 200, description: 'Notification lists' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'notification name',
    description: 'Search query for notification',
  })
  async findAll(
    @Query() query: PaginationDto & { notificationType: string },
    @Req() req: any,
  ) {
    const userId = req.user?._id;
    const data = await this.notificationService.findAll(query, userId);
    return successResponse({
      message: 'Notification lists',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.notificationService.findOne(id);
    return successResponse({
      message: 'Notification retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
