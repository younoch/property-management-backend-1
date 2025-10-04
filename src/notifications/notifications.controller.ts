import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './notification.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsGlobalController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a user' })
  @ApiResponse({ status: 200, description: 'List of user notifications', type: [Notification] })
  async findByUser(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread notifications for a user' })
  @ApiResponse({ status: 200, description: 'List of unread notifications', type: [Notification] })
  async findUnreadByUser(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUser(userId);
  }

  @Get('user/:userId/unread/count')
  @ApiOperation({ summary: 'Get count of unread notifications for a user' })
  @ApiResponse({ status: 200, description: 'Count of unread notifications', type: Object })
  async getUnreadCount(@Param('userId') userId: string): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get notifications by type' })
  @ApiResponse({ status: 200, description: 'List of notifications by type', type: [Notification] })
  async findByType(@Param('type') type: string): Promise<Notification[]> {
    return this.notificationsService.findByType(type);
  }

  @Get('channel/:channel')
  @ApiOperation({ summary: 'Get notifications by channel' })
  @ApiResponse({ status: 200, description: 'List of notifications by channel', type: [Notification] })
  async findByChannel(@Param('channel') channel: string): Promise<Notification[]> {
    return this.notificationsService.findByChannel(channel);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification found', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification updated', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/mark-read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Post('user/:userId/mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read', type: Object })
  async markAllAsRead(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }
}

@ApiTags('notifications')
@Controller('portfolios/:portfolioId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification for a portfolio' })
  @ApiResponse({ status: 201, description: 'Notification created successfully', type: Notification })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async create(
    @Param('portfolioId') portfolioId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create({ ...createNotificationDto, portfolio_id: portfolioId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for a portfolio' })
  @ApiResponse({ status: 200, description: 'List of portfolio notifications', type: [Notification] })
  async findByPortfolio(@Param('portfolioId') portfolioId: string): Promise<Notification[]> {
    return this.notificationsService.findByPortfolio(portfolioId);
  }
} 