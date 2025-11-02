import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Payment } from './payment.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { getManager } from 'typeorm';

@Entity()
@Index(['invoice_id'])
@Index(['payment_id'])
@Index(['id'], { unique: true })
export class PaymentApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  readonly payment_id: string;

  @Column()
  readonly invoice_id: string;

  @ManyToOne(() => Payment, (p) => p.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value || '0')
    }
  })
  @ApiProperty({
    description: 'Amount applied from payment to invoice',
    example: 100.00,
    type: Number
  })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Invoice status updates are now handled by the PaymentsService
  // to prevent race conditions and ensure data consistency
}
