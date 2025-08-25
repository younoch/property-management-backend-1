import { Entity, Column, ManyToOne, PrimaryColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './invoice.entity';

@Entity()
@Index(['invoice_id'])
@Index(['payment_id'])
export class PaymentApplication {
  @PrimaryColumn()
  payment_id: number;

  @PrimaryColumn()
  invoice_id: number;

  @ManyToOne(() => Payment, (p) => p.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
