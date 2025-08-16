import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly repo: Repository<InvoiceItem>,
  ) {}

  create(dto: CreateInvoiceItemDto) {
    const item = this.repo.create(dto as any);
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Invoice item not found');
    return item;
  }

  async update(id: number, dto: UpdateInvoiceItemDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { success: true };
  }
}


