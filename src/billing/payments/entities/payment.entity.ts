import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ValueTransformer } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/base.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { PaymentApplication } from './payment-application.entity';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Invoice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  @ApiProperty({ 
    description: 'The invoice this payment is for',
    type: () => Invoice,
    nullable: true
  })
  invoice: Invoice | null;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ 
    description: 'ID of the associated invoice',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true
  })
  invoice_id: string | null;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  @ApiProperty({
    description: 'Payment amount',
    example: 100.00,
    type: Number
  })
  amount: number;

  @Column({ 
    type: 'numeric', 
    precision: 12, 
    scale: 2, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  @ApiProperty({
    description: 'Unapplied payment amount',
    example: 0.00,
    type: Number,
    default: 0
  })
  unapplied_amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER })
  @ApiProperty({ 
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
    description: 'Payment method used for this transaction'
  })
  payment_method: PaymentMethod | null;

  @Column({ type: 'timestamptz' })
  @ApiProperty({
    description: 'Date and time when the payment was made',
    example: '2023-11-02T12:00:00Z'
  })
  payment_date: Date;

  @ApiProperty({
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
    example: PaymentStatus.PENDING,
    description: 'Status of the payment',
    default: PaymentStatus.PENDING
  })
  @Column({ 
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Reference number for the payment',
    example: 'REF-789012',
    required: false
  })
  @Column({ type: 'varchar', nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Additional notes about the payment',
    required: false,
    nullable: true
  })
  notes?: string | null;

  @OneToMany(() => PaymentApplication, (pa) => pa.payment)
  @ApiProperty({
    description: 'Payment applications for this payment',
    type: () => [PaymentApplication],
    required: false
  })
  applications: PaymentApplication[];

}