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
  OneToMany
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { 
  addDays, 
  isAfter, 
  isBefore, 
  parseISO, 
  format,
  differenceInDays
} from 'date-fns';
import { Lease } from '../../leases/lease.entity';
import { PaymentApplication } from '../../billing/payment-application.entity';

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
@Index(['lease_id'])
@Index(['due_date'])
@Index(['status', 'due_date'])
@Index(['lease_id', 'billing_month'], { 
  unique: true, 
  where: "status != 'void'" 
})
export class Invoice {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the invoice' })
  id: number;

  @ManyToOne(() => Lease, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lease_id' })
  @ApiProperty({ 
    type: () => Lease, 
    description: 'The lease this invoice is for', 
    nullable: true 
  })
  lease: Lease | null;

  @Column({ name: 'lease_id', nullable: true })
  @ApiProperty({ 
    description: 'ID of the lease this invoice is for', 
    nullable: true,
    example: 1
  })
  lease_id: number | null;

  @Column({ 
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'Unique invoice number',
    name: 'invoice_number'
  })
  @ApiProperty({ 
    description: 'Unique invoice number',
    example: 'INV-2023-001'
  })
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
    example: '2023-01-01'
  })
  issue_date: string;

  @Column({ 
    type: 'date',
    nullable: true,
    comment: 'Due date for payment',
    name: 'due_date'
  })
  @ApiProperty({ 
    description: 'Due date for payment', 
    format: 'date',
    nullable: true,
    example: '2023-01-31'
  })
  due_date: string | null;

  @Column({ 
    type: 'integer', 
    default: 0,
    comment: 'Grace period in days after due date before late fees apply',
    name: 'grace_days'
  })
  @ApiProperty({ 
    description: 'Grace period in days after due date before late fees apply', 
    default: 0,
    example: 5
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
  @ApiProperty({ 
    description: 'Subtotal amount before tax', 
    default: 0,
    example: 1000.00
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Tax rate in percentage',
    name: 'tax_rate'
  })
  @ApiProperty({ 
    description: 'Tax rate in percentage', 
    default: 0,
    example: 8.25
  })
  tax_rate: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    comment: 'Total tax amount',
    name: 'tax_amount'
  })
  @ApiProperty({ 
    description: 'Total tax amount', 
    default: 0,
    example: 82.50
  })
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
  @ApiProperty({ 
    description: 'Remaining balance', 
    default: 0,
    example: 582.50
  })
  balance_due: number;

  @Column({
    type: 'varchar',
    length: 7,
    nullable: false,
    comment: 'Billing month in YYYY-MM format',
    name: 'billing_month'
  })
  @ApiProperty({
    example: '2023-01',
    description: 'Billing month in YYYY-MM format',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])$'
  })
  billing_month: string;

  @Column({
    type: 'date',
    nullable: false,
    comment: 'Start date of the billing period',
    name: 'period_start'
  })
  @ApiProperty({
    example: '2023-01-01',
    description: 'Start date of the billing period',
    format: 'date'
  })
  period_start: string;

  @Column({
    type: 'date',
    nullable: false,
    comment: 'End date of the billing period',
    name: 'period_end'
  })
  @ApiProperty({
    example: '2023-01-31',
    description: 'End date of the billing period',
    format: 'date'
  })
  period_end: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
    comment: 'Current status of the invoice'
  })
  @ApiProperty({
    enum: ['draft', 'open', 'partially_paid', 'paid', 'void', 'overdue'],
    example: 'open',
    description: 'Current status of the invoice'
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
  @ApiProperty({
    description: 'Terms and conditions for the invoice',
    required: false,
    example: 'Payment due within 30 days of issue date.'
  })
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
    required: false,
    example: '2023-01-01T12:00:00Z'
  })
  sent_at: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When the invoice was paid',
    name: 'paid_at'
  })
  @ApiProperty({
    description: 'When the invoice was paid',
    format: 'date-time',
    required: false,
    example: '2023-01-15T10:30:00Z'
  })
  paid_at: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: 'When the invoice was voided',
    name: 'voided_at'
  })
  @ApiProperty({
    description: 'When the invoice was voided',
    format: 'date-time',
    required: false
  })
  voided_at: Date | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional metadata for the invoice',
    name: 'metadata'
  })
  @ApiProperty({
    description: 'Additional metadata for the invoice',
    required: false,
    example: { customField: 'value' }
  })
  metadata: Record<string, any> | null;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether the invoice has been issued to the tenant',
    name: 'is_issued'
  })
  @ApiProperty({
    description: 'Whether the invoice has been issued to the tenant',
    default: false
  })
  is_issued: boolean;

  @Column({
    type: 'jsonb',
    default: () => "'[]'::jsonb",
    comment: 'Line items on this invoice',
    name: 'items',
    transformer: {
      to: (value: InvoiceItem[]) => {
        if (Array.isArray(value)) {
          return value.map(item => ({
            ...item,
            amount: decimal((item.qty || 0) * (item.unit_price || 0)),
            tax_amount: item.tax_amount || decimal((item.amount || 0) * ((item.tax_rate || 0) / 100))
          }));
        }
        return [];
      },
      from: (value: any) => value || []
    }
  })
  @ApiProperty({
    description: 'Line items on this invoice',
    type: [Object],
    example: [{
      id: 'item-1',
      type: 'rent',
      name: 'Monthly Rent',
      description: 'Rent for January 2023',
      qty: 1,
      unit_price: 1000.00,
      amount: 1000.00,
      tax_rate: 8.25,
      tax_amount: 82.50
    }]
  })
  items: InvoiceItem[];

  @OneToMany(() => PaymentApplication, paymentApp => paymentApp.invoice)
  payment_applications: PaymentApplication[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  @ApiProperty({
    description: 'When the invoice was created',
    format: 'date-time'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at'
  })
  @ApiProperty({
    description: 'When the invoice was last updated',
    format: 'date-time'
  })
  updated_at: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
    nullable: true
  })
  @ApiProperty({
    description: 'When the invoice was soft deleted',
    format: 'date-time',
    required: false
  })
  deleted_at: Date | null;

  // Helper method to handle number values safely
  private toNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      return parseFloat(value);
    }
    return 0;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    // Validate billing period
    if (this.period_start && this.period_end) {
      const start = parseISO(this.period_start);
      const end = parseISO(this.period_end);
      
      if (isAfter(start, end)) {
        throw new BadRequestException('Period start date must be before end date');
      }
    }

    // Set default due date if not set (issue date + 30 days)
    if (this.issue_date && !this.due_date) {
      this.due_date = format(
        addDays(parseISO(this.issue_date), 30),
        'yyyy-MM-dd'
      );
    }

    // Set billing month from period start if not set
    if (this.period_start && !this.billing_month) {
      this.billing_month = format(parseISO(this.period_start), 'yyyy-MM');
    }

    // Recalculate amounts
    await this.recalculate();
  }

  @AfterLoad()
  async afterLoad() {
    // Ensure all numeric fields are numbers
    this.subtotal = this.toNumber(this.subtotal);
    this.tax_amount = this.toNumber(this.tax_amount);
    this.total_amount = this.toNumber(this.total_amount);
    this.amount_paid = this.toNumber(this.amount_paid);
    this.balance_due = this.toNumber(this.balance_due);
  }

  /**
   * Recalculate all derived fields
   */
  async recalculate(entityManager = null): Promise<void> {
    // Calculate subtotal from line items
    this.subtotal = this.items.reduce((sum, item) => {
      return decimal(sum + this.toNumber(item.amount));
    }, 0);

    // Calculate tax amount if not explicitly set on items
    this.tax_amount = this.items.reduce((sum, item) => {
      return decimal(sum + this.toNumber(item.tax_amount || 0));
    }, 0);

    // Calculate total amount
    this.total_amount = decimal(this.subtotal + this.tax_amount);

    // Calculate balance due
    this.balance_due = decimal(this.total_amount - this.amount_paid);

    // Update status based on new amounts
    await this.updateStatus();
  }

  /**
   * Update invoice status based on current state
   */
  async updateStatus(): Promise<void> {
    if (this.voided_at) {
      this.status = 'void';
      return;
    }

    if (this.amount_paid <= 0) {
      this.status = 'open';
    } else if (this.balance_due <= 0) {
      this.status = 'paid';
      this.paid_at = this.paid_at || new Date();
    } else if (this.amount_paid > 0 && this.balance_due > 0) {
      this.status = 'partially_paid';
    }

    // Check if overdue
    if (this.due_date && this.status !== 'paid' && this.status !== 'void') {
      const dueDate = parseISO(this.due_date);
      const today = new Date();
      
      if (isAfter(today, dueDate)) {
        this.status = 'overdue';
      }
    }
  }

  /**
   * Check if the invoice is overdue
   */
  isOverdue(): boolean {
    if (!this.due_date || this.status === 'paid' || this.status === 'void') {
      return false;
    }
    
    const dueDate = addDays(parseISO(this.due_date), this.grace_days || 0);
    return isAfter(new Date(), dueDate);
  }

  /**
   * Issue the invoice
   */
  async issue(): Promise<void> {
    if (this.is_issued) {
      return;
    }

    if (!this.issue_date) {
      this.issue_date = format(new Date(), 'yyyy-MM-dd');
    }

    if (!this.due_date) {
      this.due_date = format(
        addDays(parseISO(this.issue_date), 30),
        'yyyy-MM-dd'
      );
    }

    this.is_issued = true;
    this.status = 'open';
    this.sent_at = new Date();
  }

  /**
   * Apply a payment to this invoice
   * @param amount Amount being paid
   * @param paymentDate Optional payment date (defaults to now)
   */
  async applyPayment(amount: number, paymentDate: Date = new Date()): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    if (this.status === 'void') {
      throw new BadRequestException('Cannot apply payment to a voided invoice');
    }

    this.amount_paid = decimal(this.amount_paid + amount);
    this.balance_due = Math.max(0, decimal(this.total_amount - this.amount_paid));
    
    // Update status based on new payment
    await this.updateStatus();
    
    // Update paid_at if fully paid
    if (this.status === 'paid' && !this.paid_at) {
      this.paid_at = paymentDate;
    }
  }

  /**
   * Void the invoice
   */
  async void(): Promise<void> {
    if (this.status === 'void') {
      return;
    }

    if (this.amount_paid > 0) {
      throw new BadRequestException('Cannot void an invoice with payments');
    }

    this.status = 'void';
    this.voided_at = new Date();
    this.balance_due = 0;
  }

  /**
   * Add a line item to the invoice
   * @param item Line item to add
   */
  addItem(item: Omit<InvoiceItem, 'id' | 'amount' | 'tax_amount' | 'created_at' | 'updated_at'>): void {
    const newItem: InvoiceItem = {
      ...item,
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: decimal(item.qty * item.unit_price),
      tax_amount: decimal((item.qty * item.unit_price) * ((item.tax_rate || 0) / 100)),
      created_at: new Date(),
      updated_at: new Date()
    };

    this.items = [...(this.items || []), newItem];
  }

  /**
   * Remove a line item from the invoice
   * @param itemId ID of the item to remove
   */
  removeItem(itemId: string): void {
    this.items = (this.items || []).filter(item => item.id !== itemId);
  }

  /**
   * Generate a summary of the invoice
   */
  getSummary() {
    return {
      id: this.id,
      invoice_number: this.invoice_number,
      issue_date: this.issue_date,
      due_date: this.due_date,
      subtotal: this.subtotal,
      tax_amount: this.tax_amount,
      total_amount: this.total_amount,
      amount_paid: this.amount_paid,
      balance_due: this.balance_due,
      status: this.status,
      is_overdue: this.isOverdue(),
      item_count: this.items?.length || 0
    };
  }
}
