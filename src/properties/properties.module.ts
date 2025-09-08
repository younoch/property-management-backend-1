import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PropertiesController, PropertiesGlobalController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property } from './property.entity';
import { Unit } from './unit.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, Unit, User]),
    JwtModule.register({}),
  ],
  controllers: [PropertiesController, PropertiesGlobalController],
  providers: [PropertiesService],
  exports: [
    PropertiesService,
    TypeOrmModule.forFeature([Property, Unit])
  ],
})
export class PropertiesModule {}