import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  OneToMany,
  Like
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { 
  addDays, 
  isAfter, 
  isBefore, 
  parseISO, 
  format,
  differenceInDays
} from 'date-fns';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Lease } from '../tenancy/lease.entity';
import { PaymentApplication } from './payment-application.entity';

// Types for invoice statuses
export type InvoiceStatus = 'draft' | 'open' | 'partially_paid' | 'paid' | 'void' | 'overdue';

// Types for invoice line items
export type InvoiceItemType = 'rent' | 'late_fee' | 'deposit' | 'other' | 'credit' | 'discount';

// Interface for invoice line items
export interface InvoiceItem {
  id: string;                   // Unique identifier for the line item
  type: InvoiceItemType;        // Type of line item
  name: string;                 // Display name
  description?: string;         // Optional description
  qty: number;                  // Quantity
  unit_price: number;           // Price per unit
  amount: number;               // Total amount (qty * unit_price)
  tax_rate?: number;            // Tax rate (0-100)
  tax_amount?: number;          // Pre-calculated tax amount
  period_start?: string;        // For time-based items like rent
  period_end?: string;          // For time-based items like rent
  metadata?: Record<string, any>; // Additional metadata
  created_at?: Date;            // When the item was created
  updated_at?: Date;            // When the item was last updated
}

// Helper for consistent decimal arithmetic
const decimal = (value: number | string, decimals: number = 2): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return parseFloat(num.toFixed(decimals));
};

@Entity('invoices')
@Index(['portfolio_id'])
@Index(['lease_id'])
@Index(['due_date'])
@Index(['status', 'due_date']) // For faster status-based queries
@Index(['lease_id', 'billing_month'], { unique: true, where: "status != 'void'" }) // Prevent duplicate invoices for same lease and month
export class Invoice {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the invoice' })
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  @ApiProperty({ type: () => Portfolio, description: 'The portfolio this invoice belongs to' })
  portfolio: Portfolio;

  @Column({ name: 'portfolio_id' })
  @ApiProperty({ description: 'ID of the portfolio this invoice belongs to' })
  portfolio_id: number;

  @ManyToOne(() => Lease, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lease_id' })
  @ApiProperty({ type: () => Lease, description: 'The lease this invoice is for', nullable: true })
  lease: Lease | null;

  @Column({ name: 'lease_id', nullable: true })
  @ApiProperty({ description: 'ID of the lease this invoice is for', nullable: true })
  lease_id: number | null;

  @Column({ 
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'Unique invoice number',
    name: 'invoice_number'
  })
  @ApiProperty({ description: 'Unique invoice number' })
  invoice_number: string;

  @Column({ 
    type: 'date',
    comment: 'Date when the invoice was created/issued',
    name: 'issue_date',
    default: () => 'CURRENT_DATE'
  })
  @ApiProperty({ 
    description: 'Date when the invoice was created/issued', 
    format: 'date',
    default: 'CURRENT_DATE'
  })
  issue_date: string;

  @Column({ 
    type: 'date',
    nullable: true,
    comment: 'Due date for payment, calculated based on issue_date + payment_terms',
    name: 'due_date'
  })
  @ApiProperty({ description: 'Due date for payment', format: 'date', nullable: true })
  due_date: string | null;

  @Column({ 
    type: 'integer', 
    default: 0,
    comment: 'Grace period in days after due date before late fees apply',
    name: 'grace_days'
  })
  @ApiProperty({ 
    description: 'Grace period in days after due date before late fees apply', 
    default: 0 
  })
  grace_days: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Subtotal amount before tax',
    name: 'subtotal'
  })
  @ApiProperty({ description: 'Subtotal amount before tax', default: 0 })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Total tax amount',
    name: 'tax_amount'
  })
  @ApiProperty({ description: 'Total tax amount', default: 0 })
  tax_amount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Total amount including tax',
    name: 'total_amount'
  })
  @ApiProperty({ 
    description: 'Total amount including tax', 
    default: 0,
    example: 1082.50
  })
  total_amount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Amount paid so far',
    name: 'amount_paid'
  })
  @ApiProperty({ 
    description: 'Amount paid so far', 
    default: 0,
    example: 500.00
  })
  amount_paid: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Remaining balance',
    name: 'balance_due'
  })
  @ApiProperty({ description: 'Remaining balance', default: 0 })
  balance_due: number;

  @ApiProperty({
    example: '2025-09-01',
    description: 'Start date of the billing period (ISO format)',
    format: 'date',
    required: true
  })
  @Column({ 
    type: 'date', 
    nullable: false,
    comment: 'Start date of the billing period (ISO format)'
  })
  period_start: string;

  @ApiProperty({
    example: '2025-09',
    description: 'Billing month in YYYY-MM format',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])$',
    required: true
  })
  @Column({ 
    type: 'varchar', 
    length: 7, 
    nullable: false,
    comment: 'Billing month in YYYY-MM format',
    default: () => "to_char(CURRENT_DATE, 'YYYY-MM')"  // Default to current month
  })
  billing_month: string;

  @ApiProperty({
    example: '2025-09-30',
    description: 'End date of the billing period (ISO format)',
    format: 'date',
    required: true
  })
  @Column({ 
    type: 'date', 
    nullable: false,
    comment: 'End date of the billing period (ISO format)'
  })
  period_end: string;

  @ApiProperty({
    enum: ['draft', 'open', 'partially_paid', 'paid', 'void', 'overdue'],
    enumName: 'InvoiceStatus',
    example: 'open',
    description: 'Current status of the invoice'
  })
  @Column({
    type: 'varchar', 
    length: 20, 
    default: 'draft',
    comment: 'Current status of the invoice'
  })
  status: InvoiceStatus;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Additional notes for the invoice',
    name: 'notes'
  })
  @ApiProperty({
    description: 'Additional notes for the invoice',
    required: false,
    example: 'Payment due upon receipt'
  })
  notes: string | null;

  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Terms and conditions for the invoice',
    name: 'terms'
  })
  @ApiProperty({ description: 'Terms and conditions for the invoice', required: false })
  terms: string | null;

  @Column({ 
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When the invoice was sent to the customer',
    name: 'sent_at'
  })
  @ApiProperty({ 
    description: 'When the invoice was sent to the customer', 
    format: 'date-time',
    required: false 
  })
  sent_at: Date | null;

  @Column({ 
    type: 'timestamp',
    nullable: true,
    comment: 'When the invoice was paid'
  })
  paid_at: Date | null;

  @Column({ 
    type: 'timestamp',
    nullable: true,
    comment: 'When the invoice was marked as void'
  })
  voided_at: Date | null;

  @Column({ 
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata for the invoice'
  })
  metadata: Record<string, any> | null;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether the invoice has been issued to the tenant'
  })
  is_issued: boolean;

  @Column({
    type: 'jsonb',
    default: () => "'[]'::jsonb",
    comment: 'Line items on this invoice',
    transformer: {
      to: (value: InvoiceItem[]) => {
        if (Array.isArray(value)) {
          return value.map(item => ({
            ...item,
            amount: decimal(item.qty * item.unit_price)
          }));
        }
        return [];
      },
      from: (value: any) => value || []
    }
  })
  items: InvoiceItem[];


  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  // Track original values for immutability checks
  @Exclude({ toPlainOnly: true })
  private originalValues: Partial<Invoice> = {};

  // Load original values after entity is loaded
  @AfterLoad()
  private loadOriginalValues() {
    this.originalValues = {
      issue_date: this.issue_date,
      due_date: this.due_date,
      status: this.status,
      subtotal: this.subtotal,
      tax_amount: this.tax_amount,
      total_amount: this.total_amount,
      items: [...this.items]
    };
  }

  // Validate before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  private validate() {
    // Prevent modifications to void invoices
    if (this.originalValues.status === 'void') {
      throw new BadRequestException('Cannot modify a voided invoice');
    }

    // Ensure due_date is after issue_date if both are set
    if (this.issue_date && this.due_date) {
      const issueDate = parseISO(this.issue_date);
      const dueDate = parseISO(this.due_date);
      
      if (isBefore(dueDate, issueDate)) {
        throw new BadRequestException('Due date must be on or after issue date');
      }
    }

    // Ensure total is not negative (credits will be handled separately)
    if (this.total_amount !== undefined && this.total_amount < 0) {
      throw new BadRequestException('Invoice total cannot be negative. Use credits for overpayments.');
    }

    // Validate status transitions only when status changes
    if (this.status && this.originalValues.status && this.status !== this.originalValues.status) {
      const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
        'draft': ['open', 'void'],
        'open': ['partially_paid', 'paid', 'void', 'overdue'],
        'partially_paid': ['paid', 'void', 'overdue'],
        'paid': ['void'],
        'void': [],
        'overdue': ['partially_paid', 'paid', 'void']
      };

      const allowedTransitions = validTransitions[this.originalValues.status as InvoiceStatus] || [];
      if (!allowedTransitions.includes(this.status as InvoiceStatus)) {
        throw new BadRequestException(
          `Invalid status transition from ${this.originalValues.status} to ${this.status}`
        );
      }
    }
  }

  // Helper method to handle number values safely
  private toNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const num = parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  }

  // Calculate the total paid amount from payment applications
  async getPaidAmount(entityManager: any = null): Promise<number> {
    if (!entityManager) return 0;
    
    const applications = await entityManager.find(PaymentApplication, {
      where: { invoice_id: this.id }
    });
    
    return applications.reduce(
      (sum: number, app: PaymentApplication) => sum + this.toNumber(app.amount), 
      0
    );
  }

  // Recalculate all derived fields
  async recalculate(entityManager: any): Promise<void> {
    if (!this.items?.length) {
      this.subtotal = 0;
      this.tax_amount = 0;
      this.total_amount = 0;
      this.balance_due = 0;
      this.amount_paid = await this.getPaidAmount(entityManager);
      return;
    }

    // Calculate subtotal from items
    this.subtotal = parseFloat(this.items
      .reduce((sum, item) => sum + this.toNumber(item.amount), 0)
      .toFixed(2));

    // Calculate tax (simplified - in real app, this would use tax rules)
    this.tax_amount = 0;
    
    // Calculate total
    this.total_amount = parseFloat((this.subtotal + this.tax_amount).toFixed(2));
    
    // Get paid amount
    this.amount_paid = await this.getPaidAmount(entityManager);
    
    // Calculate balance due
    this.balance_due = parseFloat((this.total_amount - this.amount_paid).toFixed(2));
    
    // Update status based on new values
    await this.updateStatus();
  }

  // Update invoice status based on current state
  async updateStatus(): Promise<void> {
    if (this.status === 'void') return;
    
    if (this.balance_due <= 0 && this.total_amount > 0) {
      this.status = 'paid';
    } else if (this.amount_paid > 0 && this.balance_due > 0) {
      this.status = 'partially_paid';
    } else if (this.is_overdue) {
      this.status = 'overdue';
    } else if (this.is_issued) {
      this.status = 'open';
    } else {
      this.status = 'draft';
    }
  }

  // Issue the invoice
  async issue(entityManager: any): Promise<void> {
    if (this.is_issued) return;
    
    // Set issued date to now if not set
    if (!this.issue_date) {
      this.issue_date = new Date().toISOString().split('T')[0];
    }
    
    // Set due date if not set (issue date + 30 days by default)
    if (!this.due_date) {
      const dueDate = new Date(this.issue_date);
      dueDate.setDate(dueDate.getDate() + 30);
      this.due_date = dueDate.toISOString().split('T')[0];
    }
    
    // Generate invoice number if not set (format: INV-YYYYMMDD-XXXX)
    if (!this.invoice_number) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(1000 + Math.random() * 9000);
      this.invoice_number = `INV-${date}-${random}`;
    }
    
    // Set issued flag and update status
    this.is_issued = true;
    await this.recalculate(entityManager);
    
    // Generate invoice number if not set
    if (!this.invoice_number) {
      // Format: INV-YYYYMMDD-XXXX (where X is a sequential number)
      const prefix = 'INV';
      const datePart = format(new Date(), 'yyyyMMdd');
      const count = await entityManager.count(Invoice, {
        where: {
          portfolio_id: this.portfolio_id,
          invoice_number: Like(`${prefix}-${datePart}-%`)
        }
      });
      this.invoice_number = `${prefix}-${datePart}-${String(count + 1).padStart(4, '0')}`;
    }
  }


  // Check if the invoice is overdue
  get is_overdue(): boolean {
    if (this.status === 'void' || this.status === 'paid' || !this.due_date) return false;
    const dueDate = parseISO(this.due_date);
    const graceEnd = addDays(dueDate, this.grace_days);
    return isAfter(new Date(), graceEnd);
  }
}
