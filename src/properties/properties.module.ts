import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { Property } from './property.entity';
import { PropertiesController, PropertiesGlobalController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Unit } from './unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, Unit, User]),
    AuthModule,
  ],
  controllers: [
    PropertiesController, 
    PropertiesGlobalController
  ],
  providers: [PropertiesService],
  exports: [
    PropertiesService,
    TypeOrmModule.forFeature([Property, Unit])
  ],
})
export class PropertiesModule {}
