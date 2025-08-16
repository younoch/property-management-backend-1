import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';

@Injectable()
export class InvoiceGenerationScheduler {
  private readonly logger = new Logger(InvoiceGenerationScheduler.name);

  constructor(
    @InjectRepository(LeaseCharge) private readonly chargeRepo: Repository<LeaseCharge>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private readonly itemRepo: Repository<InvoiceItem>,
  ) {}

  // Runs daily at 01:00 AM; generates invoices for charges that start today or are monthly and due this month
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateMonthlyInvoices(): Promise<void> {
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = today.getUTCMonth(); // 0-based
    const monthStart = new Date(Date.UTC(yyyy, mm, 1));
    const monthEnd = new Date(Date.UTC(yyyy, mm + 1, 0));

    // Fetch active monthly charges whose date window includes this month
    const charges = await this.chargeRepo.createQueryBuilder('c')
      .where('c.cadence = :cadence', { cadence: 'monthly' })
      .andWhere('c.start_date <= :monthEnd', { monthEnd: monthEnd.toISOString().slice(0, 10) })
      .andWhere('(c.end_date IS NULL OR c.end_date >= :monthStart)', { monthStart: monthStart.toISOString().slice(0, 10) })
      .getMany();

    for (const charge of charges) {
      // Determine invoice issue/due date for this month (issue first day, due 5th by default)
      const issueDate = monthStart.toISOString().slice(0, 10);
      const due = new Date(Date.UTC(yyyy, mm, 5));
      const dueDate = due.toISOString().slice(0, 10);

      // Check if invoice already exists for lease+month to avoid duplicates
      const existing = await this.invoiceRepo.createQueryBuilder('i')
        .where('i.account_id = :account', { account: charge.account_id })
        .andWhere('i.lease_id = :lease', { lease: charge.lease_id })
        .andWhere('i.issue_date = :issueDate', { issueDate })
        .getOne();
      if (existing) continue;

      // Create invoice and line item based on charge
      const subtotal = charge.amount as unknown as number;
      const invoice = this.invoiceRepo.create({
        account_id: charge.account_id,
        lease_id: charge.lease_id,
        issue_date: issueDate,
        due_date: dueDate,
        status: 'open' as any,
        subtotal: subtotal as any,
        tax: 0 as any,
        total: subtotal as any,
        balance: subtotal as any,
      });
      const savedInvoice = await this.invoiceRepo.save(invoice);

      const item = this.itemRepo.create({
        invoice_id: savedInvoice.id,
        name: charge.name,
        qty: 1 as any,
        unit_price: charge.amount as any,
        amount: charge.amount as any,
      });
      await this.itemRepo.save(item);
    }

    this.logger.log(`Monthly invoice generation completed for ${charges.length} charges`);
  }
}


