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
import { PortfolioScopeGuard } from '../guards/account.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsGlobalController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'List of all notifications', type: [Notification] })
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of user notifications', type: [Notification] })
  async findByUser(@Param('userId', ParseIntPipe) userId: number): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread notifications for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of unread notifications', type: [Notification] })
  async findUnreadByUser(@Param('userId', ParseIntPipe) userId: number): Promise<Notification[]> {
    return this.notificationsService.findUnreadByUser(userId);
  }

  @Get('user/:userId/unread/count')
  @ApiOperation({ summary: 'Get count of unread notifications for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Count of unread notifications' })
  async getUnreadCount(@Param('userId', ParseIntPipe) userId: number): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get notifications by type' })
  @ApiParam({ name: 'type', description: 'Notification type' })
  @ApiResponse({ status: 200, description: 'List of notifications by type', type: [Notification] })
  async findByType(@Param('type') type: string): Promise<Notification[]> {
    return this.notificationsService.findByType(type);
  }

  @Get('channel/:channel')
  @ApiOperation({ summary: 'Get notifications by channel' })
  @ApiParam({ name: 'channel', description: 'Notification channel' })
  @ApiResponse({ status: 200, description: 'List of notifications by channel', type: [Notification] })
  async findByChannel(@Param('channel') channel: string): Promise<Notification[]> {
    return this.notificationsService.findByChannel(channel);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification found', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: Notification })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id', ParseIntPipe) id: number): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Param('userId', ParseIntPipe) userId: number): Promise<{ message: string }> {
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
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notificationsService.remove(id);
  }
}

@ApiTags('notifications')
@Controller('portfolios/:portfolioId/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification for an account' })
  @ApiResponse({ status: 201, description: 'Notification created successfully', type: Notification })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.create({ ...createNotificationDto, portfolio_id: portfolioId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for an account' })
  @ApiResponse({ status: 200, description: 'List of account notifications', type: [Notification] })
  async findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<Notification[]> {
    return this.notificationsService.findByPortfolio(portfolioId);
  }
} 