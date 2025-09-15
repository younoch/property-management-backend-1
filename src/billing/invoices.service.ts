import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, DataSource, Not, IsNull } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceItem, InvoiceItemType } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Lease } from '../tenancy/lease.entity';
import { Portfolio } from '../portfolios/portfolio.entity';
import { EmailService } from '../email/email.service';
import { PdfService } from '../pdf/pdf.service';
import { ConfigService } from '@nestjs/config';
import { SentMessageInfo } from 'nodemailer';
import { Tenant } from '../tenancy/tenant.entity';

type InvoiceWithRelations = Omit<Invoice, 'lease' | 'items'> & {
  portfolio: Portfolio;
  lease: Lease & {
    id: number;
    tenant_name: string;
    tenant_email?: string;
    tenant_phone?: string;
    property_address?: string;
    tenant?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  items: Array<{
    id: string;
    type: string;
    name: string;
    description?: string;
    qty: number;
    unit_price: number;
    amount: number;
    tax_rate?: number;
    tax_amount?: number;
    period_start?: string;
    period_end?: string;
  }>;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
  
    @InjectRepository(Lease)
    private readonly leaseRepo: Repository<Lease>,
  
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
  
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
  
    @Inject(forwardRef(() => PdfService))
    private readonly pdfService: PdfService,
  
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a unique invoice number in the format: INV-{YYYYMMDD}-{XXXX}
   * where XXXX is a sequential number starting from 0001
   */
  private async generateInvoiceNumber(portfolioId: number): Promise<string> {
    // First verify the portfolio exists
    const portfolio = await this.portfolioRepo.findOne({
      where: { id: portfolioId }
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    // Use first 3 characters of portfolio name or 'P' + portfolio ID if name is not available
    const portfolioPrefix = portfolio.name 
      ? portfolio.name.substring(0, 3).toUpperCase() 
      : `P${portfolioId}`;
    const prefix = `INV-${portfolioPrefix}-${dateStr}-`;
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      // Find the latest invoice with the same prefix in the same portfolio
      const latestInvoice = await this.repo
        .createQueryBuilder('invoice')
        .where('invoice.portfolio_id = :portfolioId', { portfolioId })
        .andWhere('invoice.invoice_number LIKE :prefix', { prefix: `${prefix}%` })
        .orderBy('invoice.invoice_number', 'DESC')
        .getOne();

      let sequence = 1;
      if (latestInvoice?.invoice_number) {
        // Extract the sequence number from the latest invoice
        const parts = latestInvoice.invoice_number.split('-');
        const lastSequence = parseInt(parts[parts.length - 1] || '0', 10);
        sequence = isNaN(lastSequence) ? 1 : lastSequence + 1 + attempt;
      } else {
        sequence = 1 + attempt;
      }

      // Format with leading zeros (e.g., 0001, 0002, etc.)
      const newInvoiceNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;
      
      // Check if this invoice number is unique
      const isUnique = await this.isInvoiceNumberUnique(portfolioId, newInvoiceNumber);
      if (isUnique) {
        return newInvoiceNumber;
      }
      
      attempt++;
    }

    // If we couldn't find a unique number after max attempts, throw an error
    throw new Error('Failed to generate a unique invoice number after multiple attempts');
  }

  async isInvoiceNumberUnique(portfolioId: number, invoiceNumber: string, excludeId?: number): Promise<boolean> {
    // First verify the portfolio exists
    const portfolio = await this.portfolioRepo.findOne({
      where: { id: portfolioId }
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);
    }
    
    // Check for existing invoice with the same number in the same portfolio
    const where: any = { 
      portfolio_id: portfolioId,
      invoice_number: invoiceNumber,
    };
    
    if (excludeId) {
      where.id = Not(excludeId);
    }
    
    const count = await this.repo.count({ where });
    return count === 0;
  }

  // Helper method to calculate due date (30 days from issue date by default)
  private calculateDueDate(issueDate?: string): string {
    const date = issueDate ? new Date(issueDate) : new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  // Helper method to validate and normalize invoice item type
  private getValidInvoiceItemType(type: string): InvoiceItemType {
    const validTypes: InvoiceItemType[] = ['rent', 'late_fee', 'deposit', 'other', 'credit', 'discount'];
    const normalizedType = type.toLowerCase() as InvoiceItemType;
    if (validTypes.includes(normalizedType)) {
      return normalizedType;
    }
    throw new BadRequestException(`Invalid invoice item type: ${type}`);
  }

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    // Ensure required fields are present
    if (!dto.portfolio_id) {
      throw new BadRequestException('Portfolio ID is required');
    }

    // Verify portfolio exists
    const portfolio = await this.portfolioRepo.findOne({
      where: { id: dto.portfolio_id }
    });
    
    if (!portfolio) {
      throw new BadRequestException(`Portfolio with ID ${dto.portfolio_id} not found`);
    }

    // Create a new invoice instance with default values
    const invoice = new Invoice();
    Object.assign(invoice, {
      ...dto,
      status: 'draft' as InvoiceStatus,
      issue_date: dto.issue_date || new Date().toISOString().split('T')[0],
      due_date: dto.due_date || this.calculateDueDate(dto.issue_date),
      amount_paid: (dto as any).amount_paid || 0,
      is_issued: false,
      created_at: new Date(),
      updated_at: new Date(),
      portfolio_id: dto.portfolio_id,
      lease_id: dto.lease_id || null
    });

    // Process items if they exist
    if (dto.items && dto.items.length > 0) {
      const processedItems = dto.items.map(item => {
        // Ensure required fields are present
        if (item.qty === undefined || item.unit_price === undefined) {
          throw new BadRequestException('Quantity and unit price are required for all invoice items');
        }

        // Parse numeric values
        const qty = Number(item.qty);
        const unitPrice = Number(item.unit_price);
        const amount = qty * unitPrice;
        const taxRate = 'tax_rate' in item && item.tax_rate !== undefined ? Number(item.tax_rate) : 0;
        const taxAmount = (amount * taxRate) / 100;

        // Create new invoice item with proper typing
        const invoiceItem: InvoiceItem = {
          id: item.id || Math.random().toString(36).substr(2, 9), // Generate ID if not provided
          name: item.name || 'Invoice Item', // Default name if not provided
          description: item.description,
          type: this.getValidInvoiceItemType(item.type),
          qty,
          unit_price: unitPrice,
          amount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          period_start: item.period_start,
          period_end: item.period_end,
          created_at: new Date(),
          updated_at: new Date(),
          metadata: (item as any).metadata || {}
        };
        
        return invoiceItem;
      });
      
      // Calculate totals
      const subtotal = processedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalTax = processedItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
      const totalAmount = subtotal + totalTax;
      
      // Set calculated values using the correct property names
      invoice.subtotal = subtotal;
      invoice.tax_amount = totalTax;
      invoice.total_amount = totalAmount;
      invoice.balance_due = totalAmount - (invoice.amount_paid || 0);
      // Convert items to the correct format for the entity
      invoice.items = processedItems as unknown as any[];
    }
    
    // Generate invoice number if not provided
    if (!invoice.invoice_number) {
      invoice.invoice_number = await this.generateInvoiceNumber(dto.portfolio_id);
    }
    
    // Set default issue date to today if not provided
    if (!invoice.issue_date) {
      invoice.issue_date = new Date().toISOString().split('T')[0];
    }
    
    // Set due date if not provided (default to 30 days from issue date)
    if (!invoice.due_date) {
      const dueDate = new Date(invoice.issue_date);
      dueDate.setDate(dueDate.getDate() + 30);
      invoice.due_date = dueDate.toISOString().split('T')[0];
    }

    // Calculate totals if not provided
    if (!invoice.subtotal && invoice.items?.length) {
      invoice.subtotal = invoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }

    // Calculate tax amount if not provided but rate is
    if (invoice.tax_rate && !invoice.tax_amount) {
      invoice.tax_amount = (invoice.subtotal * invoice.tax_rate) / 100;
    }

    // Calculate total amount if not provided
    if (!invoice.total_amount) {
      invoice.total_amount = (invoice.subtotal || 0) + (invoice.tax_amount || 0);
    }

    // Set initial balance
    invoice.balance_due = invoice.total_amount;
    
    // Save the invoice
    return this.repo.save(invoice);
  }

  findAll(billingMonth?: string) {
    const where: any = {};
    if (billingMonth) {
      where.billing_month = billingMonth;
    }
    return this.repo.find({ where });
  }

  async findByPortfolio(portfolioId: number) {
    // First verify the portfolio exists
    const portfolio = await this.portfolioRepo.findOne({ 
      where: { id: portfolioId } 
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);
    }
    
    return this.repo.find({ 
      where: { portfolio_id: portfolioId },
      relations: ['lease'] // Include related data
    });
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

    // Verify the portfolio exists
    const portfolio = await this.portfolioRepo.findOne({
      where: { id: portfolioId }
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);
    }

    // Verify the lease exists and belongs to the portfolio
    const lease = await this.leaseRepo.findOne({
      where: { 
        id: leaseId,
        portfolio_id: portfolioId
      }
    });
    
    if (!lease) {
      throw new NotFoundException(
        `Lease with ID ${leaseId} not found in portfolio ${portfolioId}`
      );
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
        type: string;
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
    const lease = await this.leaseRepo.findOne({ 
      where: { id: leaseId },
      relations: ['unit', 'lease_tenants', 'lease_tenants.tenant']
    });
    if (!lease) throw new NotFoundException('Lease not found');

    // Format billing month as YYYY-MM
    const billingMonth = new Date(billingDate).toISOString().slice(0, 7);
    
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
          `An invoice for ${new Date(billingMonth + '-01').toLocaleString('default', { month: 'long' })} ${billingMonth.slice(0, 4)} already exists. ` +
          'To add additional charges, include them in the request or use the force flag to override.'
        );
      }
      
      // Add additional charges to existing invoice
      const updatedItems = [...(existingInvoice.items || [])];
      
      // Add additional charges with generated IDs if not provided
      for (const charge of additionalCharges) {
        const itemType = this.getValidInvoiceItemType(charge.type);
        const qty = charge.qty || 1;
        const unitPrice = charge.unit_price || charge.amount;
        const amount = qty * unitPrice;
        const taxRate = 0; // Default to 0 if not provided
        const taxAmount = (amount * taxRate) / 100;
        
        updatedItems.push({
          id: charge.id || crypto.randomUUID(),
          type: itemType,
          name: charge.name,
          description: charge.description,
          qty,
          unit_price: unitPrice,
          amount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          period_start: charge.period_start,
          period_end: charge.period_end,
          created_at: new Date(),
          updated_at: new Date()
        } as InvoiceItem);
      }
      
      // Calculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalTax = updatedItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
      const totalAmount = subtotal + totalTax;
      
      // Update invoice with calculated values
      existingInvoice.items = updatedItems as any[];
      existingInvoice.subtotal = subtotal;
      existingInvoice.tax_amount = totalTax;
      existingInvoice.total_amount = totalAmount;
      existingInvoice.balance_due = totalAmount - (existingInvoice.amount_paid || 0);
      
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

    // Calculate end date (end of the billing month)
    const periodEnd = new Date(nextDate);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(0); // Last day of current month
    
    // Calculate totals from items
    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
    const taxAmount = 0; // Assuming no tax for now
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

    // Verify the portfolio exists before creating the invoice
    const portfolio = await this.portfolioRepo.findOne({
      where: { id: lease.portfolio_id }
    });
    
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${lease.portfolio_id} not found for lease ${lease.id}`);
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(lease.portfolio_id);
    
    // Create the invoice with billing_month
    const invoice = this.repo.create({
      portfolio_id: lease.portfolio_id,
      lease_id: lease.id,
      invoice_number: invoiceNumber,
      issue_date: nextDate.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      billing_month: billingMonth,
      period_start: nextDate.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      items: items as any[], // Cast to any[] to match entity type
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      balance_due: totalAmount, // Initial balance is same as total
      status: 'open' as InvoiceStatus,
      is_issued: false,
      amount_paid: 0, // Initialize amount paid to 0
      created_at: new Date(),
      updated_at: new Date()
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
    
    // If portfolio_id is being updated, verify the new portfolio exists
    if (dto.portfolio_id && dto.portfolio_id !== invoice.portfolio_id) {
      const portfolio = await this.portfolioRepo.findOne({
        where: { id: dto.portfolio_id }
      });
      
      if (!portfolio) {
        throw new BadRequestException(`Portfolio with ID ${dto.portfolio_id} not found`);
      }
    }
    
    // If items are being updated, process them and recalculate totals
    if (dto.items) {
      // Process items and calculate new totals
      const processedItems = dto.items.map(item => {
        // Convert item to a type that includes all possible properties
        const itemData = item as any;
        const qty = itemData.qty || 1;
        const unitPrice = itemData.unit_price || 0;
        const amount = qty * unitPrice;
        const taxRate = typeof itemData.tax_rate === 'number' ? itemData.tax_rate : 0;
        const taxAmount = (amount * taxRate) / 100;
        
        // Create a properly typed invoice item
        const processedItem: InvoiceItem = {
          id: itemData.id || Math.random().toString(36).substr(2, 9),
          type: this.getValidInvoiceItemType(itemData.type || 'other'),
          name: itemData.name || 'Invoice Item',
          description: itemData.description,
          qty,
          unit_price: unitPrice,
          amount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          period_start: itemData.period_start,
          period_end: itemData.period_end,
          created_at: itemData.created_at || new Date(),
          updated_at: new Date(),
          metadata: itemData.metadata || {}
        };
        
        return processedItem;
      });
      
      const subtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = processedItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
      const totalAmount = subtotal + taxAmount;
      
      // Update invoice with new values
      Object.assign(invoice, {
        ...dto,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: totalAmount - (invoice.amount_paid || 0),
        updated_at: new Date()
      });
    } else {
      // Update other fields without changing items
      Object.assign(invoice, {
        ...dto,
        updated_at: new Date()
      });
    }
    if (dto.items) {
      // Ensure each item has an amount calculated (qty * unit_price)
      dto.items = dto.items.map(item => ({
        ...item,
        amount: (item.qty || 1) * (item.unit_price || 0)
      }));
      
      // Calculate new totals
      const subtotal = dto.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const tax = dto.tax_amount !== undefined ? dto.tax_amount : (invoice.tax_amount || 0);
      const amountPaid = invoice.amount_paid || 0;
      
      // Update invoice fields
      dto.subtotal = subtotal;
      dto.total_amount = subtotal + tax;
      dto.balance_due = dto.total_amount - amountPaid;
    }
    
    Object.assign(invoice, dto);
    return this.repo.save(invoice);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * Generate and send an invoice as PDF via email
   * @param invoiceId - ID of the invoice to send
   * @param recipientEmail - Optional email address to send to (defaults to tenant's email)
   */
  async sendInvoiceEmail(invoiceId: number): Promise<{ success: boolean; message: string }> {
    const invoice = await this.repo.findOne({
      where: { id: invoiceId },
      relations: ['portfolio', 'lease', 'lease.tenant']
    }) as unknown as InvoiceWithRelations;

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
    
    // Get recipient email - use tenant email from lease or fallback to lease tenant_email
    const toEmail = invoice.lease?.tenant?.email || invoice.lease?.tenant_email;
    if (!toEmail) {
      throw new BadRequestException('No recipient email address found for tenant');
    }

    // Format currency
    const currency = invoice.portfolio.currency || '$';
    const fromEmail = invoice.portfolio.email || this.configService.get('DEFAULT_FROM_EMAIL');
    const tenantName = invoice.lease?.tenant ? 
      `${invoice.lease.tenant.first_name} ${invoice.lease.tenant.last_name}` : 
      invoice.lease?.tenant_name || 'Valued Customer';
      
    // Send email with PDF attachment
    await this.emailService.sendEmailWithAttachment(
      toEmail,
      `Invoice #${invoice.invoice_number} from ${invoice.portfolio.name}`,
      `Please find attached your invoice #${invoice.invoice_number} for ${currency}${invoice.total_amount.toFixed(2)}.`,
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${tenantName},</p>
          <p>Please find attached your invoice <strong>#${invoice.invoice_number}</strong> for <strong>${currency}${invoice.total_amount.toFixed(2)}</strong>.</p>
          <p>Due Date: ${invoice.due_date}</p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>${invoice.portfolio.name}</p>
        </div>
      `,
      {
        filename: `invoice-${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      },
      {
        from: fromEmail,
        tenantName,
        dueDate: invoice.due_date,
        amountDue: invoice.total_amount,
        currency,
        invoiceNumber: invoice.invoice_number
      }
    );

    // Update invoice status
    await this.repo.update(invoiceId, { 
      status: 'sent' as InvoiceStatus,
      sent_at: new Date()
    });

    return { success: true, message: 'Invoice sent successfully' };
  }

}
