import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';

import { AdminService } from './admin.service';
import { AdminLoginDto, CreateAdminDto } from './dto/create-admin.dto';

@Controller('api/v1/admin')
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create admin' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 200, description: 'Admin created successfully' })
  @ApiResponse({ status: 401, description: 'Unable to create admin' })
  async create(@Body() createAdminDto: CreateAdminDto) {
    const data = await this.adminService.createAdmin(createAdminDto);
    return successResponse({
      message: 'Admin created successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Admin Login',
    description: 'Logs in the user and returns a JWT token.',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns JWT token.',
  })
  @ApiResponse({ status: 400, description: 'Invalid email or password.' })
  async login(@Body() dto: AdminLoginDto) {
    const data = await this.adminService.login(dto);
    return successResponse({
      message: 'Login successful.',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('logged-in')
  @ApiOperation({ summary: 'Get logged in admin' })
  @ApiResponse({ status: 200, description: 'Admin retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unable to retrieve admin' })
  async loggedInAdmin(@Req() req: any) {
    const adminId = req.user._id;

    if (!req) {
      throw new UnauthorizedException('Admin not authenticated');
    }
    const data = await this.adminService.loggedInAdmin(adminId);
    return successResponse({
      message: 'Admin retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
