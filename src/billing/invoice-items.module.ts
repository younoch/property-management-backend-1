import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceItemsController } from './invoice-items.controller';
import { InvoiceItemsService } from './invoice-items.service';
import { InvoiceItem } from './invoice-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem])],
  controllers: [InvoiceItemsController],
  providers: [InvoiceItemsService],
})
export class InvoiceItemsModule {}


