import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController, NotificationsGlobalController } from './notifications.controller';
import { Notification } from './notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController, NotificationsGlobalController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {} 