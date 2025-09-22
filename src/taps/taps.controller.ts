import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { TapsService } from './taps.service';
import { CreateTapsDto } from './dto/create-taps.dto';

@Controller('api/v1/taps')
@ApiTags('Add Card Taps Count')
export class TapsController {
  constructor(private readonly tapsService: TapsService) {}

  @Post()
  @ApiOperation({
    summary: 'Add Taps counts',
  })
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
}
