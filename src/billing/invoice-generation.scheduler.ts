import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { Invoice } from './invoice.entity';
@Injectable()
export class InvoiceGenerationScheduler {
  private readonly logger = new Logger(InvoiceGenerationScheduler.name);

  constructor(
    @InjectRepository(LeaseCharge) private readonly chargeRepo: Repository<LeaseCharge>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
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
        .where('i.portfolio_id = :portfolio', { portfolio: charge.portfolio_id })
        .andWhere('i.lease_id = :lease', { lease: charge.lease_id })
        .andWhere('i.issue_date = :issueDate', { issueDate })
        .getOne();
      if (existing) continue;

      // Create invoice with embedded items based on charge
      const subtotal = parseFloat(charge.amount);
      const invoice = this.invoiceRepo.create({
        portfolio_id: charge.portfolio_id,
        lease_id: charge.lease_id,
        issue_date: issueDate,
        due_date: dueDate,
        status: 'open',
        subtotal: subtotal.toString(),
        tax: '0',
        total: subtotal.toString(),
        balance: subtotal.toString(),
        items: [{
          name: charge.name,
          qty: 1,
          unit_price: subtotal,
          amount: subtotal,
        }]
      });

      await this.invoiceRepo.save(invoice);
    }

    this.logger.log(`Monthly invoice generation completed for ${charges.length} charges`);
  }
}

