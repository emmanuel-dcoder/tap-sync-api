import { Controller, Post, Body, HttpStatus, Get, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { TapsService } from './taps.service';
import { CreateTapsDto, TapProfileDto } from './dto/create-taps.dto';

@Controller('api/v1/taps')
@ApiTags('Add Card Taps Count')
export class TapsController {
  constructor(private readonly tapsService: TapsService) {}

  @Post()
  @ApiOperation({ summary: 'Add Taps counts' })
  @ApiBody({ type: CreateTapsDto })
  @ApiResponse({ status: 200, description: 'Successful' })
  @ApiResponse({ status: 401, description: 'Error performing task' })
  async create(@Body() createTapsDto: CreateTapsDto) {
    const data = await this.tapsService.addTaps(createTapsDto);
    return successResponse({
      message: 'Successful',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get Profile with tap' })
  @ApiQuery({ name: 'profileLink', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unable to perform task' })
  async profile(@Query('profileLink') profileLink: string) {
    const data = await this.tapsService.profile({ profileLink });
    return successResponse({
      message: 'Retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('profile/staff')
  @ApiOperation({ summary: 'Get Staff Profile with tap' })
  @ApiQuery({ name: 'profileLink', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unable to perform task' })
  async staffProfile(@Query('profileLink') profileLink: string) {
    const data = await this.tapsService.staffProfile({ profileLink });
    return successResponse({
      message: 'Retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
