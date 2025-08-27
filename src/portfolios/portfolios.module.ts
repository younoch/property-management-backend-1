import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    CommonModule
  ],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
  exports: [TypeOrmModule, PortfoliosService],
})
export class PortfoliosModule {}


