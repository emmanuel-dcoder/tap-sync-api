import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Put,
  UseInterceptors,
  Req,
  UseGuards,
  UploadedFiles,
  Query,
  Get,
  Patch,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateSTaffDto } from './dto/update-staff.dto';
import { employmentType, staffStatus } from './enum/staff.enum';

@Controller('api/v1/staff')
@ApiTags('Onboarding Company Staff and Manageent')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add Staff details' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Johnson Ezekiel', nullable: false },
        position: {
          type: 'string',
          example: 'Johns',
          nullable: false,
        },
        email: {
          type: 'string',
          example: 'Johns',
          nullable: true,
        },
        address: {
          type: 'string',
          example: 'Johns',
          nullable: true,
        },
        department: {
          type: 'string',
          example: 'Marketing',
          nullable: true,
        },
        employmentType: {
          type: 'string',
          example: employmentType.fullTime,
          description: 'Full-time, Part-time, Contract',
          nullable: true,
        },
        contactNo: {
          type: 'string',
          example: '+2349087675433',
          nullable: true,
        },
        emergencyContactNo: {
          type: 'string',
          example: '+2349087675433',
          nullable: true,
        },
        startDate: {
          type: 'string',
          example: '2025-01-23',
          nullable: true,
        },
        endDate: {
          type: 'string',
          example: '2025-01-23',
          nullable: true,
        },
        picture: { type: 'string', format: 'binary', nullable: true },
      },
    },
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]))
  @ApiResponse({ status: 200, description: 'Add Staff details' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async updateUserCardDetails(
    @Req() req: any,
    @Body() createStaffDto: CreateStaffDto,
    @UploadedFiles()
    files: {
      picture?: Express.Multer.File[];
    },
  ) {
    const user = req.user._id;

    const data = await this.staffService.addStaff(user, createStaffDto, files);
    return {
      message: 'Details added',
      code: HttpStatus.OK,
      status: 'success',
      data,
    };
  }

  @Put('')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update staff details' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Johnson Ezekiel', nullable: false },
        position: {
          type: 'string',
          example: 'Johns',
          nullable: true,
        },
        email: {
          type: 'string',
          example: 'Johns',
          nullable: true,
        },
        address: {
          type: 'string',
          example: 'Johns',
          nullable: true,
        },
        department: {
          type: 'string',
          example: 'Marketing',
          nullable: true,
        },
        employmentType: {
          type: 'string',
          example: 'Full-time',
          nullable: true,
        },
        contactNo: {
          type: 'string',
          example: '+2349087675433',
          nullable: true,
        },
        emergencyContactNo: {
          type: 'string',
          example: '+2349087675433',
          nullable: true,
        },
        startDate: {
          type: 'string',
          example: '2025-01-23',
          nullable: true,
        },
        endDate: {
          type: 'string',
          example: '2025-01-23',
          nullable: true,
        },
        picture: { type: 'string', format: 'binary', nullable: true },
      },
    },
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'picture', maxCount: 1 }]))
  @ApiResponse({ status: 200, description: 'Update successul' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async requestCard(
    @Query('id') id: string,
    @Body()
    updateSTaffDto: UpdateSTaffDto,
    @UploadedFiles()
    files: {
      picture?: Express.Multer.File[];
    },
  ) {
    const data = await this.staffService.updateStaff(id, updateSTaffDto, files);
    return {
      message: 'Update successful',
      code: HttpStatus.OK,
      status: 'success',
      data,
    };
  }

  @Get('')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get staff details with optional search, filter, and pagination',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
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
    example: 20,
    description: 'Number of items per page (default: 20)',
  })
  @ApiQuery({
    name: 'staffId',
    required: false,
    type: String,
    example: '624f048d886a86063a88f1d2',
    description: 'This should be mongo id',
  })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async getStaff(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('staffId') staffId?: string,
    @Query('page')
    page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const companyId = req.user._id;

    const data = await this.staffService.getStaff({
      companyId,
      staffId,
      search,
      department,
      page,
      limit,
    });

    return {
      message: 'Staff retrieved successfully',
      code: HttpStatus.OK,
      status: 'success',
      ...data,
    };
  }

  @Patch('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update staff status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '652f23f1c9e7b3f8f13b92e1' },
        status: {
          type: 'string',
          enum: Object.values(staffStatus),
          example: staffStatus.suspended,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async updateStatus(
    @Body('id') id: string,
    @Body('status') status: staffStatus,
  ) {
    const data = await this.staffService.updateStaffStatus(id, status);
    return {
      message: 'Staff status updated successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    };
  }

  @Patch('points')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add points to a staff' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '652f23f1c9e7b3f8f13b92e1' },
        points: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Points added successfully' })
  @ApiResponse({ status: 400, description: 'Error performing task' })
  async addPoints(@Body('id') id: string, @Body('points') points: number) {
    const data = await this.staffService.addPoints(id, points);
    return {
      message: 'Points added successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    };
  }
}
