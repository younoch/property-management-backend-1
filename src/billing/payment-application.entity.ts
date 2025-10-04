import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './entities/invoice.entity';

@Entity()
@Index(['invoice_id'])
@Index(['payment_id'])
@Index(['id'], { unique: true })
export class PaymentApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  payment_id: string;

  @Column()
  invoice_id: string;

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
      to: (value: string) => value,
      from: (value: string) => parseFloat(value || '0')
    }
  })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
