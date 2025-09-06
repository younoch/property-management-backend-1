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
      // Get lease start date
      const leaseStartDate = new Date(charge.start_date);
      
      // Determine if this is the first month of the lease
      const isFirstMonth = leaseStartDate.getUTCFullYear() === yyyy && 
                          leaseStartDate.getUTCMonth() === mm;
      
      // Calculate period start and end dates
      let periodStart = monthStart;
      let periodEnd = monthEnd;
      let proratedAmount = charge.amount;
      
      // If it's the first month and lease starts after the 1st, prorate the amount
      if (isFirstMonth && leaseStartDate.getUTCDate() > 1) {
        periodStart = new Date(leaseStartDate);
        const daysInMonth = new Date(yyyy, mm + 1, 0).getDate();
        const daysToBill = daysInMonth - leaseStartDate.getUTCDate() + 1;
        proratedAmount = parseFloat(((charge.amount / daysInMonth) * daysToBill).toFixed(2));
      }
      
      const issueDate = periodStart.toISOString().slice(0, 10);
      const due = new Date(periodStart);
      due.setUTCDate(5); // Due on the 5th of the month
      const dueDate = due.toISOString().slice(0, 10);

      // Check if invoice already exists for lease+month to avoid duplicates
      const existing = await this.invoiceRepo.createQueryBuilder('i')
        .where('i.portfolio_id = :portfolio', { portfolio: charge.portfolio_id })
        .andWhere('i.lease_id = :lease', { lease: charge.lease_id })
        .andWhere('i.issue_date = :issueDate', { issueDate })
        .getOne();
      if (existing) continue;

      // Create invoice items based on charge
      const description = isFirstMonth && leaseStartDate.getUTCDate() > 1
        ? `Prorated monthly charge for ${periodStart.toLocaleString('default', { month: 'long', year: 'numeric' })} (${leaseStartDate.getUTCDate()}-${periodEnd.getUTCDate()})`
        : `Monthly charge for ${periodStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`;

      const items = [{
        id: crypto.randomUUID(),
        type: 'rent' as const,
        name: charge.name,
        description,
        qty: 1,
        unit_price: proratedAmount,
        amount: proratedAmount,
        tax_rate: 0,
        tax_amount: 0,
        period_start: issueDate,
        period_end: periodEnd.toISOString().slice(0, 10)
      }];

      // Calculate totals from items
      const subtotal = parseFloat(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
      const tax = 0; // Assuming no tax for now
      const total = parseFloat((subtotal + tax).toFixed(2));

      const invoice = this.invoiceRepo.create({
        portfolio: { id: charge.portfolio_id },
        lease: { id: charge.lease_id },
        issue_date: issueDate,
        due_date: dueDate,
        status: 'open',
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
        subtotal: subtotal,
        tax: tax,
        total: total,
        balance: total,
        items: items,
        is_issued: true
      });

      await this.invoiceRepo.save(invoice);
    }

    this.logger.log(`Monthly invoice generation completed for ${charges.length} charges`);
  }
}

