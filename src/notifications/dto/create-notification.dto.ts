import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Portfolio ID for the notification',
    example: 1,
  })
  @IsNumber()
  portfolio_id: number;

  @ApiProperty({
    description: 'User ID who will receive the notification',
    example: 1,
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'Type of notification',
    example: 'property_update',
    enum: ['property_update', 'account_update', 'system_alert', 'maintenance_reminder'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'Your property "Sunset Apartments" has been updated.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Notification channel',
    example: 'email',
    enum: ['email', 'sms', 'push', 'in_app'],
  })
  @IsString()
  channel: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_read?: boolean;

  @ApiProperty({
    description: 'When the notification was sent',
    example: '2025-08-06T17:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  sent_at?: string;
} 