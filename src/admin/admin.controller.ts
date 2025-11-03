import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
  Query,
  Put,
  Param,
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

import { AdminService } from './admin.service';
import { AdminLoginDto, CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { UserStatus } from 'src/user/enum/user.enum';

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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  /**
   * GET users by accountType (with optional search)
   */
  @Get()
  @ApiOperation({
    summary: 'Fetch users by accountType',
    description:
      'Fetch all users by accountType, with optional search by name, username, or email.',
  })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  async getUsersByAccountType(
    @Query('accountType') accountType: string,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.fetchUsersByAccountType(
      accountType,
      search,
    );
    return successResponse({
      message: 'Users fetched successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /**
   * PATCH update user by ID
   * Example: PATCH /api/v1/users/64e8f0...
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update user details by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() payload: any) {
    const data = await this.adminService.updateUser(id, payload);
    return successResponse({
      message: 'User updated successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /**
   * update user status
   */
  @Put(':id/status')
  @ApiOperation({
    summary: 'Update user status (active, suspended, deactivated)',
  })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const data = await this.adminService.updateUserStatus(id, status);
    return successResponse({
      message: 'User status updated successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  /** getting users by account type */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users/:accountType')
  @ApiOperation({
    summary:
      'Fetch users by accountType (company or individual) with optional search and pagination',
  })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of users per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Optional search term (name, username, or email)',
  })
  async getUsersByType(
    @Query('accountType') accountType: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.fetchCompanyOrIndividualUsers(
      accountType,
      Number(page),
      Number(limit),
      search, // optional, can be undefined
    );

    return successResponse({
      message: 'Users fetched successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
