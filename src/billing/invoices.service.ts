import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
  ) {}

  create(dto: CreateInvoiceDto) {
    const invoice = this.repo.create(dto as any);
    return this.repo.save(invoice);
  }

  findAll() {
    return this.repo.find({ relations: ['items'] });
  }

  async findOne(id: number) {
    const invoice = await this.repo.findOne({ where: { id }, relations: ['items'] });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);
    Object.assign(invoice, dto);
    return this.repo.save(invoice);
  }

  async remove(id: number) {
    const invoice = await this.findOne(id);
    await this.repo.remove(invoice);
    return { success: true };
  }
}


