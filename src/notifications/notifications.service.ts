import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      sent_at: createNotificationDto.sent_at ? new Date(createNotificationDto.sent_at) : new Date(),
    });
    return this.notificationsRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      relations: ['user'],
    });
  }

  async findByPortfolio(portfolioId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { portfolio_id: portfolioId },
      relations: ['user'],
      order: { sent_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { sent_at: 'DESC' },
    });
  }

  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user_id: userId, is_read: false },
      relations: ['user'],
      order: { sent_at: 'DESC' },
    });
  }

  async findByType(type: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { type },
      relations: ['user'],
      order: { sent_at: 'DESC' },
    });
  }

  async findByChannel(channel: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { channel },
      relations: ['user'],
      order: { sent_at: 'DESC' },
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    
    if (updateNotificationDto.sent_at) {
      notification.sent_at = new Date(updateNotificationDto.sent_at);
    }
    
    Object.assign(notification, updateNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.is_read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true }
    );
  }

  async remove(id: number): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.remove(notification);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }
} 