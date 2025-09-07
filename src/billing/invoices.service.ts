import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { format, parseISO } from 'date-fns';
import { Invoice, InvoiceItemType } from './invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Lease } from '../tenancy/lease.entity';
import { v4 as uuidv4 } from 'uuid';

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

  findAll(billingMonth?: string) {
    const where: any = {};
    if (billingMonth) {
      where.billing_month = billingMonth;
    }
    return this.repo.find({ where });
  }

  findByPortfolio(portfolioId: number) {
    return this.repo.find({ where: { portfolio_id: portfolioId } });
  }

  findByLease(leaseId: number) {
    return this.repo.find({ where: { lease_id: leaseId } });
  }

  /**
   * Find invoices by lease ID and billing month
   * @param portfolioId - ID of the portfolio
   * @param leaseId - ID of the lease
   * @param billingMonth - Billing month in YYYY-MM format
   * @returns Array of invoices matching the criteria
   */
  async findByLeaseAndMonth(portfolioId: number, leaseId: number, billingMonth: string) {
    // Validate billing month format (YYYY-MM)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth)) {
      throw new BadRequestException('Invalid billing month format. Use YYYY-MM');
    }

    return this.repo.find({
      where: {
        portfolio_id: portfolioId,
        lease_id: leaseId,
        billing_month: billingMonth,
        status: Not('void') // Exclude voided invoices
      },
      order: {
        created_at: 'DESC' // Get the most recent first
      }
    });
  }

  /**
   * Generates the next invoice for a lease
   * @param leaseId - ID of the lease
   * @param options - Generation options
   * @param options.force - Force creation even if invoice exists for the period
   * @param options.additionalCharges - Additional charges to include in the invoice
   * @param options.billingDate - Optional billing date (defaults to current date)
   * @returns Created or updated invoice
   */
  async generateNextForLease(
    leaseId: number, 
    options: { 
      force?: boolean; 
      additionalCharges?: Array<{
        id: string;
        type: InvoiceItemType;
        name: string;
        description?: string;
        amount: number;
        qty?: number;
        unit_price?: number;
        period_start?: string;
        period_end?: string;
      }>;
      billingDate?: Date;
    } = {}
  ) {
    const { 
      force = false, 
      additionalCharges = [],
      billingDate = new Date()
    } = options;

    // Get lease with relations
    const leaseRepo = this.dataSource.getRepository(Lease);
    const lease = await leaseRepo.findOne({ 
      where: { id: leaseId },
      relations: ['unit', 'lease_tenants', 'lease_tenants.tenant']
    });
    if (!lease) throw new NotFoundException('Lease not found');

    // Format billing month as YYYY-MM
    const billingMonth = format(billingDate, 'yyyy-MM');
    
    // Check for existing invoice for this billing month
    const existingInvoice = await this.repo.findOne({
      where: {
        lease_id: leaseId,
        billing_month: billingMonth,
        status: Not('void')
      }
    });

    // Handle existing invoice
    if (existingInvoice && !force) {
      if (additionalCharges.length === 0) {
        throw new BadRequestException(
          `An invoice for ${format(parseISO(`${billingMonth}-01`), 'MMMM yyyy')} already exists. ` +
          'To add additional charges, include them in the request or use the force flag to override.'
        );
      }
      
      // Add additional charges to existing invoice
      const updatedItems = [...(existingInvoice.items || [])];
      
      // Add additional charges with generated IDs if not provided
      for (const charge of additionalCharges) {
        updatedItems.push({
          id: charge.id || uuidv4(),
          type: charge.type,
          name: charge.name,
          description: charge.description,
          amount: charge.amount,
          qty: charge.qty || 1,
          unit_price: charge.unit_price || charge.amount,
          period_start: charge.period_start,
          period_end: charge.period_end
        });
      }
      
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      existingInvoice.items = updatedItems;
      existingInvoice.subtotal = subtotal;
      existingInvoice.total = subtotal + (existingInvoice.tax || 0);
      existingInvoice.balance = existingInvoice.total - (existingInvoice.amount_paid || 0);
      
      return this.repo.save(existingInvoice);
    }

    // Determine next invoice date based on lease start date or last invoice
    let nextDate = new Date(lease.start_date);
    const lastInvoice = await this.repo.findOne({
      where: { 
        lease_id: leaseId,
        status: Not('void')
      },
      order: { issue_date: 'DESC' },
    });
    
    if (lastInvoice) {
      nextDate = new Date(lastInvoice.issue_date);
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

    // Create invoice items starting with rent
    const items: any[] = [{
      id: uuidv4(),
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
    const isFirstInvoice = !lastInvoice;
    
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

    // Create the invoice with billing_month
    const invoice = this.repo.create({
      portfolio: { id: lease.portfolio_id },
      lease: { id: lease.id },
      issue_date: nextDate.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      billing_month: billingMonth,
      period_start: nextDate.toISOString().slice(0, 10),
      period_end: new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).toISOString().slice(0, 10),
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
    
    // If items are being updated, process them and recalculate totals
    if (dto.items) {
      // Ensure each item has an amount calculated (qty * unit_price)
      dto.items = dto.items.map(item => ({
        ...item,
        amount: (item.qty || 1) * (item.unit_price || 0)
      }));
      
      // Calculate new totals
      const subtotal = dto.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const tax = dto.tax !== undefined ? dto.tax : (invoice.tax || 0);
      const amountPaid = invoice.amount_paid || 0;
      
      // Update invoice fields
      dto.subtotal = subtotal;
      dto.total = subtotal + tax;
      dto.balance = dto.total - amountPaid;
    }
    
    Object.assign(invoice, dto);
    return this.repo.save(invoice);
  }

  async remove(id: number) {
    const invoice = await this.findOne(id);
    await this.repo.remove(invoice);
    return { success: true };
  }
}


