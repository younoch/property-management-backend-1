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
  Like
} from 'typeorm';
import { Portfolio } from '../portfolios/portfolio.entity';
import { Lease } from '../tenancy/lease.entity';
import { PaymentApplication } from './payment-application.entity';
import { BadRequestException } from '@nestjs/common';
import { 
  addDays, 
  isAfter, 
  isBefore, 
  parseISO, 
  format, 
  isToday,
  differenceInDays,
  startOfDay,
  endOfDay
} from 'date-fns';

export type InvoiceStatus = 'draft' | 'open' | 'partially_paid' | 'paid' | 'void' | 'overdue';

// Helper for consistent decimal arithmetic
const decimal = (value: number | string, decimals: number = 2): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return parseFloat(num.toFixed(decimals));
};

// Types for invoice line items
export type InvoiceItemType = 'rent' | 'late_fee' | 'deposit' | 'other' | 'credit' | 'discount';

export interface InvoiceItem {
  id: string;                   // Unique identifier for the line item
  type: InvoiceItemType;        // Type of line item
  name: string;                 // Display name
  description?: string;         // Optional description
  qty: number;                 // Quantity
  unit_price: number;          // Price per unit
  amount: number;              // Total amount (qty * unit_price)
  tax_rate?: number;           // Tax rate (0-100)
  tax_amount?: number;         // Pre-calculated tax amount
  period_start?: string;       // For time-based items like rent
  period_end?: string;         // For time-based items like rent
  metadata?: Record<string, any>; // Additional metadata
}

@Entity()
@Index(['portfolio_id'])
@Index(['lease_id'])
@Index(['due_date'])
@Index(['status', 'due_date']) // For faster status-based queries
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column()
  portfolio_id: number;

  @ManyToOne(() => Lease, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease | null;

  @Column({ nullable: true })
  lease_id: number | null;

  @Column({ 
    type: 'date',
    comment: 'Date when the invoice was created/issued'
  })
  issue_date: string;

  @Column({ 
    type: 'date',
    nullable: true,
    comment: 'Due date for payment, calculated based on issue_date + payment_terms'
  })
  due_date: string | null;

  @Column({ 
    type: 'integer', 
    default: 0,
    comment: 'Grace period in days after due date before late fees apply'
  })
  grace_days: number;

  @Column({ 
    type: 'varchar', 
    nullable: true,
    unique: true,
    comment: 'Unique invoice number for reference'
  })
  invoice_number: string | null;

  @Column({ 
    type: 'varchar', 
    nullable: true,
    comment: 'Start date of the billing period (ISO format)'
  })
  period_start: string | null;

  @Column({ 
    type: 'varchar', 
    nullable: true,
    comment: 'End date of the billing period (ISO format)'
  })
  period_end: string | null;

  @Column({ 
    type: 'varchar', 
    length: 20,
    default: 'draft',
    comment: 'Invoice status: draft, open, partially_paid, paid, void, or overdue'
  })
  status: InvoiceStatus;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether the invoice has been issued to the tenant'
  })
  is_issued: boolean;

  @Column({ 
    type: 'jsonb',
    default: [],
    comment: 'Line items for this invoice',
    transformer: {
      to: (value: any) => {
        // Ensure amount is calculated and rounded for each item
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

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    default: '0.00',
    comment: 'Subtotal before tax (sum of all line items)'
  })
  subtotal: string;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2, 
    default: '0.00',
    comment: 'Total tax amount'
  })
  tax: string;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    default: '0.00',
    comment: 'Total amount including tax'
  })
  total: string;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2, 
    default: '0.00',
    comment: 'Remaining balance to be paid'
  })
  balance: string;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    default: '0.00',
    comment: 'Total amount paid so far'
  })
  amount_paid: string;

  @Column({ 
    type: 'varchar', 
    nullable: true,
    comment: 'Optional notes about the invoice'
  })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  // Track original values for immutability checks
  private originalValues: Partial<Invoice> = {};

  // Load original values after entity is loaded
  @AfterLoad()
  private loadOriginalValues() {
    this.originalValues = {
      issue_date: this.issue_date,
      due_date: this.due_date,
      status: this.status,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
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
    if (this.total !== undefined && parseFloat(this.total) < 0) {
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

  // Helper method to convert string amounts to numbers safely
  private toNumber(amount: string | number): number {
    return typeof amount === 'string' ? parseFloat(amount) : amount;
  }

  // Calculate the total paid amount from payment applications
  async getPaidAmount(entityManager: any = null): Promise<number> {
    if (!entityManager) return 0;
    
    const applications = await entityManager.find(PaymentApplication, {
      where: { invoice_id: this.id }
    });
    
    return applications.reduce(
      (sum: number, app: PaymentApplication) => sum + decimal(parseFloat(app.amount)), 
      0
    );
  }

  // Recalculate all derived fields
  async recalculate(entityManager: any): Promise<void> {
    if (this.status === 'void') return; // Void invoices are immutable

    // Calculate subtotal from items
    this.subtotal = this.items.reduce(
      (sum, item) => sum + decimal(item.amount),
      0
    ).toString();

    // Calculate total (subtotal + tax)
    this.total = (decimal(parseFloat(this.subtotal)) + decimal(parseFloat(this.tax))).toString();

    // Get paid amount and update balance
    const paid = await this.getPaidAmount(entityManager);
    this.amount_paid = paid.toString();
    this.balance = Math.max(0, decimal(parseFloat(this.total) - paid)).toString();

    // Update status based on balance
    await this.updateStatus();
  }

  // Update invoice status based on current state
  async updateStatus(): Promise<void> {
    if (this.status === 'void') return; // Void invoices are immutable
    
    const total = parseFloat(this.total);
    const paid = parseFloat(this.total) - parseFloat(this.balance);
    
    if (paid >= total) {
      this.status = 'paid';
    } else if (this.is_overdue) {
      this.status = 'overdue';
    } else if (paid > 0) {
      this.status = 'partially_paid';
    } else if (this.is_issued) {
      this.status = 'open';
    } else {
      this.status = 'draft';
    }
  }

  // Issue the invoice
  async issue(entityManager: any): Promise<void> {
    if (this.status !== 'draft') {
      throw new Error('Only draft invoices can be issued');
    }
    
    if (!this.items || this.items.length === 0) {
      throw new Error('Cannot issue an invoice with no line items');
    }
    
    // Set issue date to today if not already set
    const today = new Date().toISOString().split('T')[0];
    this.issue_date = this.issue_date || today;
    
    // Set default due date if not provided (30 days from issue date)
    if (!this.due_date) {
      const dueDate = addDays(parseISO(this.issue_date), 30);
      this.due_date = format(dueDate, 'yyyy-MM-dd');
    }
    
    // Mark as issued and set initial status
    this.is_issued = true;
    
    // Recalculate totals and update status
    await this.recalculate(entityManager);
    
    // Ensure we have a valid status after recalculation
    if (!this.status) {
      this.status = 'open';
    }
    
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
