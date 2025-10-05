import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsController, UnitsGlobalController } from './units.controller';
import { UnitsService } from './units.service';
import { Unit } from './unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitsController, UnitsGlobalController],
  providers: [UnitsService],
  exports: [UnitsService]
})
export class UnitsModule {}


