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
    return this.repo.find();
  }

  findByPortfolio(portfolioId: number) {
    return this.repo.find({ where: { portfolio_id: portfolioId } });
  }

  findByLease(leaseId: number) {
    return this.repo.find({ where: { lease_id: leaseId } });
  }

  async generateNextForLease(leaseId: number) {
    // Get lease with relations
    const leaseRepo = this.dataSource.getRepository(Lease);
    const lease = await leaseRepo.findOne({ 
      where: { id: leaseId },
      relations: ['unit', 'lease_tenants', 'lease_tenants.tenant']
    });
    if (!lease) throw new NotFoundException('Lease not found');

    // Determine period for next invoice
    const existing = await this.repo.find({ 
      where: { lease_id: leaseId }, 
      order: { issue_date: 'DESC' }, 
      take: 1 
    });
    
    let nextDate = new Date(lease.start_date);
    if (existing && existing.length > 0) {
      nextDate = new Date(existing[0].issue_date);
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    const period = `${y}-${m}`;
    const monthName = nextDate.toLocaleString('default', { month: 'long' });

    // Calculate rent amount (with proration if needed)
    let amount = Number(lease.rent);
    let isProrated = false;
    let prorationDetails = null;

    // Handle proration for first month
    if (lease.billing_day && lease.start_date) {
      const sd = new Date(lease.start_date);
      if (sd.getDate() !== lease.billing_day && period === lease.start_date.slice(0,7)) {
        const daysInMonth = new Date(y, nextDate.getMonth() + 1, 0).getDate();
        const occupiedDays = daysInMonth - sd.getDate() + 1;
        amount = Math.round((Number(lease.rent) * occupiedDays / daysInMonth) * 100) / 100;
        isProrated = true;
        prorationDetails = {
          daysInMonth,
          occupiedDays,
          dailyRate: (Number(lease.rent) / daysInMonth).toFixed(2)
        };
      }
    }

    // Set due date (default to billing day or issue date)
    const dueDate = new Date(nextDate);
    dueDate.setDate(lease.billing_day || dueDate.getDate());

    // Create invoice items
    const items: any[] = [{
      id: crypto.randomUUID(),
      type: 'rent',
      name: isProrated ? 'Prorated Rent' : 'Monthly Rent',
      description: isProrated 
        ? `Prorated rent for ${monthName} ${y} (${prorationDetails.occupiedDays}/${prorationDetails.daysInMonth} days @ $${prorationDetails.dailyRate}/day)`
        : `Monthly rent for ${monthName} ${y}`,
      qty: 1,
      unit_price: amount,
      amount: amount,
      period_start: nextDate.toISOString().slice(0, 10),
      period_end: new Date(y, nextDate.getMonth() + 1, 0).toISOString().slice(0, 10)
    }];

    // Add deposit as a separate line item for the first invoice
    const depositAmount = parseFloat(lease.deposit);
    const isFirstInvoice = !existing || existing.length === 0;
    
    if (isFirstInvoice && depositAmount > 0) {
      items.push({
        id: crypto.randomUUID(),
        type: 'deposit',
        name: 'Security Deposit',
        description: 'Refundable security deposit',
        qty: 1,
        unit_price: depositAmount,
        amount: depositAmount,
        period_start: nextDate.toISOString().slice(0, 10),
        period_end: lease.end_date // Deposit is for the entire lease term
      });
    }

    // Calculate totals from items
    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
    const tax = 0; // Assuming no tax for now
    const total = parseFloat((subtotal + tax).toFixed(2));

    // Create the invoice
    const invoice = this.repo.create({
      portfolio: { id: lease.portfolio_id },
      lease: { id: lease.id },
      issue_date: nextDate.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      period_start: nextDate.toISOString().slice(0, 10),
      period_end: new Date(y, nextDate.getMonth() + 1, 0).toISOString().slice(0, 10),
      status: 'open',
      items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      balance: total,
      is_issued: true,
      notes: isProrated ? 'Prorated for partial month' : null
    });

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


