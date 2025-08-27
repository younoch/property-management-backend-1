import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { DataSource } from 'typeorm';
import { Lease } from '../tenancy/lease.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
  private readonly dataSource: DataSource,
  ) {}

  create(dto: CreateInvoiceDto) {
    const invoice = this.repo.create(dto as any);
    return this.repo.save(invoice);
  }

  findAll() {
    return this.repo.find({ relations: ['items'] });
  }

  findByPortfolio(portfolioId: number) {
    return this.repo.find({ where: { portfolio_id: portfolioId }, relations: ['items'] });
  }

  findByLease(leaseId: number) {
    return this.repo.find({ where: { lease_id: leaseId } });
  }

  async generateNextForLease(leaseId: number) {
    // minimal generation: create next rent invoice based on lease.billing_day or lease.start_date
    const leaseRepo = this.dataSource.getRepository(Lease);
    const lease = await leaseRepo.findOne({ where: { id: leaseId } });
    if (!lease) throw new NotFoundException('Lease not found');

    // determine period (YYYY-MM) for next invoice: use lease.start_date month if none exist
    const existing = await this.repo.find({ where: { lease_id: leaseId }, order: { issue_date: 'DESC' }, take: 1 });
    let nextDate = new Date(lease.start_date);
    if (existing && existing.length > 0) {
      nextDate = new Date(existing[0].issue_date);
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    const period = `${y}-${m}`;

  // prorate first month if start_date day !== billing_day
    let amount = Number(lease.rent);
    if (lease.billing_day && lease.start_date) {
      const sd = new Date(lease.start_date);
      if (sd.getDate() !== lease.billing_day && period === lease.start_date.slice(0,7)) {
    const daysInMonth = new Date(y, nextDate.getMonth() + 1, 0).getDate();
    const occupiedDays = daysInMonth - sd.getDate() + 1;
        amount = Math.round((Number(lease.rent) * occupiedDays / daysInMonth) * 100) / 100;
      }
    }

    const dueDate = new Date(nextDate);
    dueDate.setDate(lease.billing_day || dueDate.getDate());

    const subtotal = amount.toFixed(2);
    const tax = (0).toFixed(2);
    const total = subtotal;
    const balance = subtotal;

    const invoice = this.repo.create({
      portfolio_id: lease.portfolio_id,
      lease_id: lease.id,
      issue_date: nextDate.toISOString().slice(0,10),
      due_date: dueDate.toISOString().slice(0,10),
      status: 'open',
      subtotal,
      tax,
      total,
      balance,
    } as any);

    return this.repo.save(invoice);
  }

  async findOne(id: number) {
    const invoice = await this.repo.findOne({ where: { id } });
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


