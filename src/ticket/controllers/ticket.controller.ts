import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Req,
  Get,
  Query,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { TicketService } from '../services/ticket.service';
import { PaginationDto } from 'src/core/common/pagination/pagination';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { status } from '../enum/ticket.enum';

@ApiTags('ticket')
@Controller('api/v1/ticket')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateTicketDto })
  @ApiOperation({ summary: 'Submit ticket query' })
  @ApiResponse({
    status: 201,
    description: 'ticket submitted',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Req() req: any, @Body() payload: CreateTicketDto) {
    const user = req.user._id;
    const data = await this.ticketService.create({
      ...payload,
      user,
    });
    return successResponse({
      message: 'Ticket submitted',
      code: HttpStatus.CREATED,
      status: 'success',
      data,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ticket with search, pagination and status filter',
  })
  @ApiResponse({ status: 200, description: 'Ticket lists' })
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
    example: 'search ticket',
    description: 'Search query for ticket by name, subject, status',
  })
  async findAll(@Query() query: PaginationDto, @Req() req: any) {
    const userId = req.user?._id;
    const data = await this.ticketService.findAll(query);
    return successResponse({
      message: 'Ticket lists',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by Id' })
  @ApiResponse({
    status: 200,
    description: 'Ticket retrieved',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.ticketService.findOne(id);
    return successResponse({
      message: 'Ticket retrieved',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', required: true, description: 'Ticket ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(status),
          example: 'resolved',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Ticket status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') newStatus: status,
  ) {
    const data = await this.ticketService.updateStatus(id, newStatus);
    return successResponse({
      message: 'Ticket status updated successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
