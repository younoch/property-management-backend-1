import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto, FeedbackDataDto } from './dto/feedback-response.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit new feedback' })
  @ApiResponse({
    status: 201,
    description: 'Feedback submitted successfully',
    type: FeedbackDataDto,
  })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackDataDto> {
    // Return raw payload; TransformInterceptor will wrap into standard response
    const feedbackData = await this.feedbackService.create(createFeedbackDto);
    return feedbackData as unknown as FeedbackDataDto;
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all feedback (Admin/Manager only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'reviewed', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of feedback items',
    type: FeedbackResponseDto,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('reviewed') reviewed?: boolean,
  ): Promise<FeedbackResponseDto> {
    const { data, total } = await this.feedbackService.findAll(page, limit, reviewed);
    // Return data with meta inside; interceptor will wrap once
    return {
      data,
      meta: { total, page, limit },
    } as unknown as FeedbackResponseDto;
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Mark feedback as reviewed (Admin/Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'Feedback marked as reviewed',
    type: FeedbackDataDto,
  })
  @ApiParam({ name: 'id', type: String, description: 'Feedback ID (UUID)' })
  async markAsReviewed(
    @Param('id') id: string,
  ): Promise<FeedbackDataDto> {
    const feedbackData = await this.feedbackService.markAsReviewed(id);
    return feedbackData as unknown as FeedbackDataDto;
  }
}
