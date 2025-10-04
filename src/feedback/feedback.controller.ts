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
import { FeedbackResponseDto } from './dto/feedback-response.dto';
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
    type: FeedbackResponseDto,
  })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const feedbackData = await this.feedbackService.create(createFeedbackDto);
    const response = new FeedbackResponseDto();
    response.success = true;
    response.message = 'Thank you for your feedback! We appreciate you taking the time to share your thoughts with us.';
    response.data = feedbackData;
    response.timestamp = new Date().toISOString();
    response.path = '/feedback';
    return response;
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
    const response = new FeedbackResponseDto();
    response.success = true;
    response.message = 'Feedback retrieved successfully';
    response.data = data;
    response.meta = {
      total,
      page,
      limit,
    };
    response.timestamp = new Date().toISOString();
    response.path = '/feedback';
    return response;
  }

  @Patch(':id/review')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Mark feedback as reviewed (Admin/Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'Feedback marked as reviewed',
    type: FeedbackResponseDto,
  })
  @ApiParam({ name: 'id', type: String, description: 'Feedback ID (UUID)' })
  async markAsReviewed(
    @Param('id') id: string,
  ): Promise<FeedbackResponseDto> {
    const feedbackData = await this.feedbackService.markAsReviewed(id);
    const response = new FeedbackResponseDto();
    response.success = true;
    response.message = 'Feedback marked as reviewed successfully';
    response.data = feedbackData;
    response.timestamp = new Date().toISOString();
    response.path = `/feedback/${id}/review`;
    return response;
  }
}
