import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsController, UnitsGlobalController } from './units.controller';
import { UnitsService } from './units.service';
import { Unit } from '../properties/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitsController, UnitsGlobalController],
  providers: [UnitsService],
})
export class UnitsModule {}


